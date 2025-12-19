import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
  enabled?: boolean;
}

const useCountUp = (
  targetValue: number,
  options: UseCountUpOptions = {}
): number => {
  const { duration = 1800, delay = 0, decimals = 0, enabled = true } = options;
  const [currentValue, setCurrentValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCurrentValue(0);
      return;
    }

    const startAnimation = () => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smoother easing function (ease-out quart)
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        
        const value = easedProgress * targetValue;
        setCurrentValue(Number(value.toFixed(decimals)));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startTimeRef.current = null;
    };
  }, [targetValue, duration, delay, decimals, enabled]);

  return currentValue;
};

export default useCountUp;
