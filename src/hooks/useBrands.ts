import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();

    const channel = supabase
      .channel('brands-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brands' },
        () => fetchBrands()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addBrand = async (brand: Omit<Brand, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('brands')
      .insert(brand)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteBrand = async (id: string) => {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const activeBrands = brands.filter(b => b.is_active);

  return {
    brands,
    activeBrands,
    loading,
    error,
    addBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands,
  };
};
