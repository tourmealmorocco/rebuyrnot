import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import BrandCarousel from './BrandCarousel';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  const { t } = useLanguage();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10"
    >
      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
        {t.heroTitle || 'What did you buy?'}
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        {t.heroSubtitle || 'Would you buy it again?'}{' '}
        <span className="text-success font-semibold">🟢</span> {t.or || 'or'}{' '}
        <span className="text-destructive font-semibold">🔴</span>
      </p>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t.searchPlaceholder || 'Search products, brands...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-border focus:border-primary transition-colors bg-background"
        />
      </div>

      {/* Brand Carousel */}
      <BrandCarousel />
    </motion.section>
  );
};

export default HeroSection;
