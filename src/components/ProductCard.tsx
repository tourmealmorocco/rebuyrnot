import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScoreBar from './ScoreBar';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  onVote: (productId: string, vote: 'rebuy' | 'not') => void;
}

const ProductCard = ({ product, onVote }: ProductCardProps) => {
  const { t, isRTL } = useLanguage();
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'rebuy' | 'not' | null>(null);
  const [localProduct, setLocalProduct] = useState(product);

  const isTrending = product.recentVotes > 20;
  const totalVotes = localProduct.rebuyCount + localProduct.notCount;
  const rebuyPercent = totalVotes > 0 ? (localProduct.rebuyCount / totalVotes) * 100 : 50;

  useEffect(() => {
    const voted = localStorage.getItem(`rebuyrnot-vote-${product.id}`);
    if (voted) {
      setHasVoted(true);
      setUserVote(voted as 'rebuy' | 'not');
    }
  }, [product.id]);

  const handleVote = (vote: 'rebuy' | 'not') => {
    if (hasVoted) return;
    
    localStorage.setItem(`rebuyrnot-vote-${product.id}`, vote);
    setHasVoted(true);
    setUserVote(vote);
    
    // Update local count for immediate feedback
    setLocalProduct(prev => ({
      ...prev,
      rebuyCount: vote === 'rebuy' ? prev.rebuyCount + 1 : prev.rebuyCount,
      notCount: vote === 'not' ? prev.notCount + 1 : prev.notCount,
    }));
    
    onVote(product.id, vote);
  };

  const handleShare = () => {
    const text = `${product.brand} ${product.name}: ${rebuyPercent.toFixed(0)}% would rebuy! ${t.shareText}`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border/50"
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

        {/* Voting Section */}
        <AnimatePresence mode="wait">
          {!hasVoted ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3"
            >
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleVote('rebuy')}
                className="flex-1 vote-btn vote-btn-success"
              >
                🟢 {t.rebuy}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleVote('not')}
                className="flex-1 vote-btn vote-btn-destructive"
              >
                🔴 {t.not}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="score"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ScoreBar rebuyPercent={rebuyPercent} totalVotes={totalVotes} />
              
              {/* User vote indicator & share */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className={`text-xs ${userVote === 'rebuy' ? 'text-success' : 'text-destructive'}`}>
                  {t.voted}: {userVote === 'rebuy' ? t.rebuy : t.not}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t.share}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
