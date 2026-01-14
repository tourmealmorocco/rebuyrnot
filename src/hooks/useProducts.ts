import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/data/products';
import { logger, validateComment } from '@/lib/logger';

// Generate a simple fingerprint for the user
const getUserFingerprint = (): string => {
  let fingerprint = localStorage.getItem('user-fingerprint');
  if (!fingerprint) {
    fingerprint = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('user-fingerprint', fingerprint);
  }
  return fingerprint;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching products:', error);
      return;
    }

    // Map database columns to Product interface
    const mappedProducts: Product[] = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category as Product['category'],
      image: p.image || '',
      rebuyCount: p.rebuy_votes || 0,
      notCount: p.not_votes || 0,
      recentVotes: 0,
      description: p.description || '',
      topRebuyReasons: p.rebuy_reasons || [],
      topNotReasons: p.not_reasons || [],
      comments: []
    }));

    setProducts(mappedProducts);
  };

  useEffect(() => {
    fetchProducts().finally(() => setLoading(false));

    // Subscribe to realtime updates
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getProductById = (id: string) => products.find(p => p.id === id);

  const getTotalVotes = () => products.reduce((acc, p) => acc + p.rebuyCount + p.notCount, 0);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newId = Date.now().toString();
    const { error } = await supabase.from('products').insert({
      id: newId,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.image,
      rebuy_votes: product.rebuyCount,
      not_votes: product.notCount,
      description: product.description,
      rebuy_reasons: product.topRebuyReasons,
      not_reasons: product.topNotReasons
    });

    if (error) {
      logger.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.rebuyCount !== undefined) dbUpdates.rebuy_votes = updates.rebuyCount;
    if (updates.notCount !== undefined) dbUpdates.not_votes = updates.notCount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.topRebuyReasons !== undefined) dbUpdates.rebuy_reasons = updates.topRebuyReasons;
    if (updates.topNotReasons !== undefined) dbUpdates.not_reasons = updates.topNotReasons;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  };

  const submitVote = async (productId: string, voteType: 'rebuy' | 'not', comment?: string) => {
    const fingerprint = getUserFingerprint();

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('user_votes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_fingerprint', fingerprint)
      .maybeSingle();

    if (existingVote) {
      throw new Error('Already voted');
    }

    // Record vote attempt for rate limiting
    await supabase.from('vote_rate_limits').insert({
      user_fingerprint: fingerprint
    });

    // Insert vote (RLS policy will check rate limit)
    const { error: voteError } = await supabase.from('user_votes').insert({
      product_id: productId,
      user_fingerprint: fingerprint,
      vote_type: voteType
    });

    if (voteError) {
      // Check if it's a rate limit error
      if (voteError.message.includes('rate') || voteError.code === '42501') {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      logger.error('Error submitting vote:', voteError);
      throw voteError;
    }

    // Update product vote count
    const product = products.find(p => p.id === productId);
    if (product) {
      const updates = voteType === 'rebuy'
        ? { rebuy_votes: product.rebuyCount + 1 }
        : { not_votes: product.notCount + 1 };

      await supabase.from('products').update(updates).eq('id', productId);
    }

    // Add comment if provided (with validation)
    if (comment) {
      const commentError = validateComment(comment);
      if (commentError) {
        throw new Error(commentError);
      }
      
      await supabase.from('comments').insert({
        product_id: productId,
        vote_type: voteType,
        text: comment.trim()
      });
    }
  };

  const checkUserVote = async (productId: string) => {
    const fingerprint = getUserFingerprint();
    const { data } = await supabase
      .from('user_votes')
      .select('vote_type')
      .eq('product_id', productId)
      .eq('user_fingerprint', fingerprint)
      .maybeSingle();

    return data ? data.vote_type as 'rebuy' | 'not' : null;
  };

  return {
    products,
    loading,
    getProductById,
    getTotalVotes,
    addProduct,
    updateProduct,
    deleteProduct,
    submitVote,
    checkUserVote,
    refetch: fetchProducts
  };
};

export const useComments = () => {
  const [comments, setComments] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    productBrand: string;
    vote: 'rebuy' | 'not';
    text: string;
    date: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        product_id,
        vote_type,
        text,
        created_at,
        products (
          name,
          brand
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching comments:', error);
      return;
    }

    const mappedComments = (data || []).map(c => ({
      id: c.id,
      productId: c.product_id,
      productName: (c.products as { name: string; brand: string } | null)?.name || 'Unknown',
      productBrand: (c.products as { name: string; brand: string } | null)?.brand || 'Unknown',
      vote: c.vote_type as 'rebuy' | 'not',
      text: c.text,
      date: c.created_at
    }));

    setComments(mappedComments);
  };

  useEffect(() => {
    fetchComments().finally(() => setLoading(false));

    // Subscribe to realtime updates
    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) {
      logger.error('Error deleting comment:', error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    deleteComment,
    refetch: fetchComments
  };
};
