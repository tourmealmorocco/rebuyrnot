import { motion } from 'framer-motion';
import { useBrands } from '@/hooks/useBrands';

const BrandCarousel = () => {
  const { activeBrands, loading } = useBrands();

  if (loading || activeBrands.length === 0) {
    return null;
  }

  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...activeBrands, ...activeBrands, ...activeBrands];

  return (
    <div className="w-full overflow-hidden py-6">
      <motion.div
        className="flex items-center gap-12"
        animate={{
          x: [0, -100 * activeBrands.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: activeBrands.length * 3,
            ease: 'linear',
          },
        }}
      >
        {duplicatedBrands.map((brand, index) => (
          <div
            key={`${brand.id}-${index}`}
            className="flex-shrink-0 hover:scale-110 transition-transform duration-300"
          >
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default BrandCarousel;
