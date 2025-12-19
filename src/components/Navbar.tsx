import { Search, Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalVotes: number;
}

const Navbar = ({ searchQuery, onSearchChange, totalVotes }: NavbarProps) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'عربي' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.h1 
            className="text-xl md:text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Rebuy<span className="text-success">R</span>not
          </motion.h1>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full bg-secondary/50 rounded-full py-2.5 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm focus:outline-none focus:ring-2 focus:ring-success/50 transition-all`}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Total votes counter */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-muted-foreground">{t.totalScores}</span>
              <motion.span 
                className="font-bold text-lg tabular-nums"
                key={totalVotes}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {totalVotes.toLocaleString()}
              </motion.span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
              <Globe className="h-4 w-4 text-muted-foreground mx-1" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    language === lang.code
                      ? 'bg-foreground text-background'
                      : 'hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mt-3">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-secondary/50 rounded-full py-2.5 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm focus:outline-none focus:ring-2 focus:ring-success/50 transition-all`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
