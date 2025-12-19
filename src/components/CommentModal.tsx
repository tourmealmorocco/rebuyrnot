import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  vote: 'rebuy' | 'not';
}

const CommentModal = ({ isOpen, onClose, onSubmit, vote }: CommentModalProps) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
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
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {t.writeReview}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Vote indicator */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  vote === 'rebuy' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {vote === 'rebuy' ? '🟢' : '🔴'} {vote === 'rebuy' ? t.idRebuy : t.notAgain}
                </span>
              </div>

              {/* Comment input */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.reviewPlaceholder}
                className="min-h-32 mb-6 resize-none rounded-2xl"
              />

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-full"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className={`flex-1 rounded-full ${
                    vote === 'rebuy'
                      ? 'bg-success hover:bg-success/90 text-success-foreground'
                      : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  }`}
                >
                  {t.submit}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;
