import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import ScoreBar from './ScoreBar';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { t, isRTL } = useLanguage();

  const isTrending = product.recentVotes > 20;
  const totalVotes = product.rebuyCount + product.notCount;
  const rebuyPercent = totalVotes > 0 ? (product.rebuyCount / totalVotes) * 100 : 50;

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer hover:scale-[1.02]"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            className="w-full h-full object-cover"
          />
          
          {/* Category Badge */}
          <span className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium`}>
            {t.categories[product.category]}
          </span>

          {/* Trending Badge */}
          {isTrending && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
            >
              <Flame className="h-3 w-3" />
              {t.trending}
            </motion.span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Product Info */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h3 className="text-lg font-semibold">{product.name}</h3>
          </div>

          {/* Score Bar - Always visible */}
          <ScoreBar rebuyPercent={rebuyPercent} totalVotes={totalVotes} />
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
