import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'rebuyrnot-mission-seen';

const MissionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (alreadySeen) return;

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setTimeout(() => {
          setIsVisible(true);
        }, 500);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="glass rounded-3xl p-5 shadow-2xl border border-border/30">
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div dir="rtl" className="text-right space-y-4 pt-4">
              <p className="text-foreground leading-relaxed">
                🛡️ تجربتك مع هاد المنتج ماشي غير معلومة، هي حماية لواحد آخر غدي يشري نفس المنتوج.
              </p>

              <p className="text-foreground leading-relaxed">
                ملي كتقول <span className="text-destructive font-semibold">Not</span>، راك كتوقف سلسلة ديال النصب وكتفضح الجودة الضعيفة. وملي كتقول <span className="text-success font-semibold">Rebuy</span>، راك كتدل شخص أخر على الهمزة الحقيقية و الجودة.
              </p>

              <p className="text-foreground leading-relaxed">
                ماتخليش تجربتك توقف عندك.. اعطي <span className="font-bold">'The Score'</span> اليوم، وكون نتا هو الحاجز ضد النصب وضياع الفلوس. 💪
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionPopup;
