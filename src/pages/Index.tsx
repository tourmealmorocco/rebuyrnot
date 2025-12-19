import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import MissionPopup from '@/components/MissionPopup';
import { products, getTotalVotes } from '@/data/products';
import { useLanguage } from '@/contexts/LanguageContext';

type Category = 'all' | 'cars' | 'tech' | 'beauty' | 'fashion' | 'home';

const Index = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const totalVotes = getTotalVotes();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalVotes={totalVotes}
      />

      <main className="container mx-auto px-4 pt-32 pb-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {t.theScore}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t.rebuy} <span className="text-success font-semibold">🟢</span> or {t.not}{' '}
            <span className="text-destructive font-semibold">🔴</span>
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
        </motion.div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-muted-foreground text-lg">No products found</p>
          </motion.div>
        )}

        <MissionPopup />
      </main>
    </div>
  );
};

export default Index;
