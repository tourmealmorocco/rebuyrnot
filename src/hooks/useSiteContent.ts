import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContent {
  id: string;
  content_key: string;
  content_en: string;
  content_fr: string;
  content_ar: string;
  content_type: string;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('category', { ascending: true })
        .order('content_key', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    const channel = supabase
      .channel('site-content-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content' },
        () => fetchContent()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getContent = (key: string, language: 'en' | 'fr' | 'ar'): string => {
    const item = content.find(c => c.content_key === key);
    if (!item) return key;
    
    switch (language) {
      case 'en': return item.content_en;
      case 'fr': return item.content_fr;
      case 'ar': return item.content_ar;
      default: return item.content_en;
    }
  };

  const addContent = async (newContent: Omit<SiteContent, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('site_content')
      .insert(newContent)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateContent = async (id: string, updates: Partial<SiteContent>) => {
    const { data, error } = await supabase
      .from('site_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const contentByCategory = content.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SiteContent[]>);

  const categories = [...new Set(content.map(c => c.category))];
  const contentTypes = [...new Set(content.map(c => c.content_type))];

  return {
    content,
    contentByCategory,
    categories,
    contentTypes,
    loading,
    error,
    getContent,
    addContent,
    updateContent,
    deleteContent,
    refetch: fetchContent,
  };
};
