import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import useCountUp from '@/hooks/useCountUp';
import useInView from '@/hooks/useInView';

interface ScoreBarProps {
  rebuyPercent: number;
  totalVotes: number;
}

const ScoreBar = ({ rebuyPercent, totalVotes }: ScoreBarProps) => {
  const { t } = useLanguage();
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const notPercent = 100 - rebuyPercent;
  
  const animatedRebuy = useCountUp(rebuyPercent, { duration: 1800, delay: 200, enabled: isInView });
  const animatedNot = useCountUp(notPercent, { duration: 1800, delay: 200, enabled: isInView });

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-success">{t.rebuy}</span>
        <span className="text-muted-foreground">{t.theScore}</span>
        <span className="text-destructive">{t.not}</span>
      </div>

      <div className="relative h-4 bg-secondary rounded-full overflow-hidden flex">
        <motion.div
          className="h-full bg-success"
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${rebuyPercent}%` : 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        <motion.div
          className="h-full bg-destructive"
          initial={{ width: 0 }}
          animate={{ width: isInView ? `${notPercent}%` : 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <motion.span 
          className="font-bold text-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          {animatedRebuy}%
        </motion.span>
        <motion.span 
          className="text-muted-foreground text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: 0.4 }}
        >
          {totalVotes.toLocaleString()} {t.votes}
        </motion.span>
        <motion.span 
          className="font-bold text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          {animatedNot}%
        </motion.span>
      </div>
    </div>
  );
};

export default ScoreBar;
