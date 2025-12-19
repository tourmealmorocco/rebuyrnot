import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const STORAGE_KEY = 'rebuyrnot-mission-seen';

const MissionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (!alreadySeen) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleAgree = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
            className="relative glass rounded-3xl p-8 shadow-2xl border border-border/30 max-w-lg w-full"
          >
            <div dir="rtl" className="text-right space-y-6">
              <p className="text-foreground leading-relaxed text-lg">
                🛡️ تجربتك مع هاد المنتج ماشي غير معلومة، هي حماية لواحد آخر غدي يشري نفس المنتوج.
              </p>

              <p className="text-foreground leading-relaxed text-lg">
                ملي كتقول <span className="text-destructive font-semibold">Not</span>، راك كتوقف سلسلة ديال النصب وكتفضح الجودة الضعيفة. وملي كتقول <span className="text-success font-semibold">Rebuy</span>، راك كتدل شخص أخر على الهمزة الحقيقية و الجودة.
              </p>

              <p className="text-foreground leading-relaxed text-lg">
                ماتخليش تجربتك توقف عندك.. اعطي <span className="font-bold">'The Score'</span> اليوم، وكون نتا هو الحاجز ضد النصب وضياع الفلوس. 💪
              </p>

              <button
                onClick={handleAgree}
                className="w-full mt-4 py-4 px-8 rounded-2xl bg-success text-success-foreground font-semibold text-lg hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                متافقين؟
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionPopup;
