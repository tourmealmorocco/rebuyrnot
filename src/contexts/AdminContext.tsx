import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';

const AUTH_KEY = 'rebuyrnot-admin-auth';
const ADMIN_PASSWORD = 'admin123'; // In production, use proper auth

interface AdminContextType {
  products: Product[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getTotalVotes: () => number;
  refetch: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

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
      .channel('admin-products-changes')
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

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

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
      console.error('Error adding product:', error);
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
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const getProductById = (id: string) => products.find(p => p.id === id);

  const getTotalVotes = () => products.reduce((acc, p) => acc + p.rebuyCount + p.notCount, 0);

  return (
    <AdminContext.Provider value={{
      products,
      isAuthenticated,
      loading,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getTotalVotes,
      refetch: fetchProducts,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
