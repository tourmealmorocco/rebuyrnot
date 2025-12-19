import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductScoreDisplayProps {
  rebuyPercent: number;
  totalVotes: number;
}

const ProductScoreDisplay = ({ rebuyPercent, totalVotes }: ProductScoreDisplayProps) => {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-2"
      >
        <span className="text-7xl md:text-8xl font-bold text-foreground">
          {rebuyPercent.toFixed(0)}%
        </span>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold tracking-wider mb-3"
      >
        <span className="text-success">REBUY</span>
        <span className="text-destructive">RNOT</span>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm uppercase tracking-wide"
      >
        {t.finalVerdict} {totalVotes.toLocaleString()}+ {t.owners}
      </motion.p>
    </div>
  );
};

export default ProductScoreDisplay;
