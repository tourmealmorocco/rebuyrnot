import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductSubmissionModal = ({ isOpen, onClose }: ProductSubmissionModalProps) => {
  const { t, isRTL } = useLanguage();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [productName, setProductName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName.trim()) {
      toast({ title: t.nameRequired || 'Please enter a product name', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('product_submissions').insert({
        user_id: user?.id || null,
        product_name: productName.trim(),
        brand_name: 'Unknown', // Required field, using placeholder
      });

      if (error) throw error;

      setSubmitted(true);
      setProductName('');
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({ title: 'Error submitting product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setProductName('');
    onClose();
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
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl p-6 z-50 shadow-xl"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 hover:bg-secondary rounded-full transition-colors`}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {submitted ? (
              /* Thank You Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6"
              >
                <h2 className="text-xl font-bold mb-6">
                  {t.thankYouSubmission}
                </h2>
                <motion.h1 
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Rebuy<span className="text-success">R</span>not
                </motion.h1>
                <Button 
                  onClick={handleClose} 
                  className="mt-8"
                  variant="outline"
                >
                  {t.cancel}
                </Button>
              </motion.div>
            ) : (
              /* Form */
              <div>
                <h2 className="text-xl font-bold mb-6">
                  {t.submitProduct || 'Suggest a Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">{t.productName || 'Product Name'}</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. iPhone 15 Pro"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                      {t.cancel}
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 gap-2">
                      <Send className="w-4 h-4" />
                      {loading ? '...' : (t.submit || 'Submit')}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductSubmissionModal;
