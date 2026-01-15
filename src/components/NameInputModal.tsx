import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

interface NameInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NameInputModal = ({ isOpen, onClose, onSuccess }: NameInputModalProps) => {
  const { t, isRTL } = useLanguage();
  const { updateProfile, profile } = useUser();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: t.nameRequired,
        variant: 'destructive'
      });
      return;
    }

    if (name.trim().length < 2) {
      toast({
        title: t.nameTooShort,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name.trim());
      toast({ title: t.profileUpdated });
      setName('');
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error updating profile',
        variant: 'destructive'
      });
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl p-6 z-50 shadow-xl"
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
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">{t.enterYourName}</h2>
              <p className="text-muted-foreground text-sm mb-2">
                {profile?.email}
              </p>
              <p className="text-muted-foreground text-xs mb-6">{t.nameExplanation}</p>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="mb-4 h-12 text-center"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || !name.trim()}
                  className="flex-1"
                >
                  {loading ? '...' : t.continue}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NameInputModal;
