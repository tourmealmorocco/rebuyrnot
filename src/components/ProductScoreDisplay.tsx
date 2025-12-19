import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import useCountUp from '@/hooks/useCountUp';
import useInView from '@/hooks/useInView';

interface ProductScoreDisplayProps {
  rebuyPercent: number;
  totalVotes: number;
}

const ProductScoreDisplay = ({ rebuyPercent, totalVotes }: ProductScoreDisplayProps) => {
  const { t } = useLanguage();
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const animatedPercent = useCountUp(rebuyPercent, { duration: 1800, delay: 300, enabled: isInView });

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: isInView ? 1 : 0.8, opacity: isInView ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-2"
      >
        <span className="text-5xl sm:text-7xl md:text-8xl font-bold text-foreground">
          {animatedPercent}%
        </span>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 10 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider mb-2 sm:mb-3"
      >
        <span className="text-success">REBUY</span>
        <span className="text-destructive">RNOT</span>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wide"
      >
        {t.finalScore} {totalVotes.toLocaleString()}+ {t.owners}
      </motion.p>
    </div>
  );
};

export default ProductScoreDisplay;
