import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import useCountUp from '@/hooks/useCountUp';

interface ScoreBarProps {
  rebuyPercent: number;
  totalVotes: number;
}

const ScoreBar = ({ rebuyPercent, totalVotes }: ScoreBarProps) => {
  const { t } = useLanguage();
  const notPercent = 100 - rebuyPercent;
  
  const animatedRebuy = useCountUp(rebuyPercent, { duration: 1500, delay: 100 });
  const animatedNot = useCountUp(notPercent, { duration: 1500, delay: 100 });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-success">{t.rebuy}</span>
        <span className="text-muted-foreground">{t.theScore}</span>
        <span className="text-destructive">{t.not}</span>
      </div>

      <div className="relative h-4 bg-secondary rounded-full overflow-hidden flex">
        <motion.div
          className="h-full bg-success"
          initial={{ width: 0 }}
          animate={{ width: `${rebuyPercent}%` }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        />
        <motion.div
          className="h-full bg-destructive"
          initial={{ width: 0 }}
          animate={{ width: `${notPercent}%` }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <motion.span 
          className="font-bold text-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {animatedRebuy}%
        </motion.span>
        <motion.span 
          className="text-muted-foreground text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {totalVotes.toLocaleString()} {t.votes}
        </motion.span>
        <motion.span 
          className="font-bold text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {animatedNot}%
        </motion.span>
      </div>
    </div>
  );
};

export default ScoreBar;
