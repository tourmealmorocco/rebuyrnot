import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

type Category = 'all' | 'cars' | 'tech' | 'beauty' | 'fashion' | 'home';

interface CategoryPillsProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

const CategoryPills = ({ selected, onSelect }: CategoryPillsProps) => {
  const { t } = useLanguage();

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t.categories.all },
    { key: 'cars', label: t.categories.cars },
    { key: 'tech', label: t.categories.tech },
    { key: 'beauty', label: t.categories.beauty },
    { key: 'fashion', label: t.categories.fashion },
    { key: 'home', label: t.categories.home },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <motion.button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === cat.key
              ? 'bg-foreground text-background shadow-lg'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryPills;
