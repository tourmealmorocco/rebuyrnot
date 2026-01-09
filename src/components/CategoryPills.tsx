import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { motion } from 'framer-motion';

interface CategoryPillsProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryPills = ({ selected, onSelect }: CategoryPillsProps) => {
  const { language } = useLanguage();
  const { activeCategories, loading } = useCategories();

  // Get label based on current language
  const getLabel = (category: { name_en: string; name_fr: string; name_ar: string }) => {
    switch (language) {
      case 'fr':
        return category.name_fr;
      case 'ar':
        return category.name_ar;
      default:
        return category.name_en;
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-20 bg-secondary rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {activeCategories.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.key)}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === cat.key
              ? 'bg-foreground text-background shadow-lg'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          {getLabel(cat)}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryPills;
