import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductSubmissionModal = ({ isOpen, onClose }: ProductSubmissionModalProps) => {
  const { t, isRTL } = useLanguage();
  const { user } = useUser();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    category: '',
    description: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.brandName.trim()) {
      toast({ title: t.nameRequired || 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('product_submissions').insert({
        user_id: user?.id || null,
        product_name: formData.productName.trim(),
        brand_name: formData.brandName.trim(),
        category: formData.category || null,
        description: formData.description.trim() || null,
        image_url: formData.imageUrl.trim() || null,
      });

      if (error) throw error;

      toast({ title: t.thankYou || 'Thank you! Your product suggestion has been submitted.' });
      setFormData({ productName: '', brandName: '', category: '', description: '', imageUrl: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({ title: 'Error submitting product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl p-6 z-50 shadow-xl max-h-[90vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 hover:bg-secondary rounded-full transition-colors`}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div>
              <h2 className="text-xl font-bold mb-2">
                {t.submitProduct || 'Suggest a Product'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {t.submitProductDesc || 'Submit a product you want others to vote on'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">{t.productName || 'Product Name'} *</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. iPhone 15 Pro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandName">{t.brandName || 'Brand'} *</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="e.g. Apple"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t.category || 'Category'}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory || 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.key}>
                          {cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.description || 'Description'}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.productDescPlaceholder || 'Brief description of the product...'}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">{t.imageUrl || 'Image URL'}</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    {t.cancel}
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 gap-2">
                    <Send className="w-4 h-4" />
                    {loading ? '...' : (t.submit || 'Submit')}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductSubmissionModal;
