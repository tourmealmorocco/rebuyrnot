import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'rebuyrnot-mission-seen';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'الدارجة', flag: '🇲🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const MissionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('ar');
  const { setLanguage, t, isRTL } = useLanguage();

  useEffect(() => {
    const alreadySeen = localStorage.getItem(STORAGE_KEY);
    if (!alreadySeen) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
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
    setLanguage(selectedLang);
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
            <div className="space-y-6">
              {/* Language Selection */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">Choose your language</span>
                </div>
                
                <div className="flex justify-center gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 min-w-[90px] ${
                        selectedLang === lang.code
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-foreground">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/50" />

              {/* Mission Text - changes based on selected language */}
              <div dir={selectedLang === 'ar' ? 'rtl' : 'ltr'} className={`${selectedLang === 'ar' ? 'text-right' : 'text-left'} space-y-4`}>
                {selectedLang === 'ar' && (
                  <>
                    <p className="text-foreground leading-relaxed">
                      🛡️ تجربتك مع هاد المنتج ماشي غير معلومة، هي حماية لواحد آخر غدي يشري نفس المنتوج.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      ملي كتقول <span className="text-destructive font-semibold">Not</span>، راك كتوقف سلسلة ديال النصب وكتفضح الجودة الضعيفة.
                      وملي كتقول <span className="text-success font-semibold">Rebuy</span>، راك كتدل شخص أخر على الهمزة الحقيقية و الجودة.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      ماتخليش تجربتك توقف عندك..
                      اعطي <span className="font-semibold">'The Score'</span> اليوم، وكون نتا هو الحاجز ضد النصب وضياع الفلوس. 💪
                    </p>
                  </>
                )}
                {selectedLang === 'fr' && (
                  <>
                    <p className="text-foreground leading-relaxed">
                      🛡️ Votre expérience avec ce produit n'est pas qu'une simple info, c'est une protection pour quelqu'un d'autre.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      Quand vous dites <span className="text-destructive font-semibold">Not</span>, vous arrêtez une chaîne d'arnaque et exposez la mauvaise qualité.
                      Quand vous dites <span className="text-success font-semibold">Rebuy</span>, vous guidez quelqu'un vers l'excellence et la qualité.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      Ne gardez pas votre expérience pour vous..
                      Donnez <span className="font-semibold">'The Score'</span> aujourd'hui, et soyez la barrière contre les arnaques et la perte d'argent. 💪
                    </p>
                  </>
                )}
                {selectedLang === 'en' && (
                  <>
                    <p className="text-foreground leading-relaxed">
                      🛡️ Your experience with this product isn't just information, it's protection for someone else about to buy the same thing.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      When you say <span className="text-destructive font-semibold">Not</span>, you stop a scam chain and expose poor quality.
                      When you say <span className="text-success font-semibold">Rebuy</span>, you guide someone to real excellence and quality.
                    </p>
                    <p className="text-foreground leading-relaxed">
                      Don't let your experience stop with you..
                      Give <span className="font-semibold">'The Score'</span> today, and be the barrier against scams and wasted money. 💪
                    </p>
                  </>
                )}
              </div>

              <button
                onClick={handleAgree}
                className="w-full py-4 px-8 rounded-2xl bg-success text-success-foreground font-semibold text-lg hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {selectedLang === 'ar' ? 'متافقين؟' : selectedLang === 'fr' ? "D'accord!" : "I Agree!"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionPopup;
