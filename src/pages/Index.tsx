import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import MissionPopup from '@/components/MissionPopup';
import HeroSection from '@/components/HeroSection';
import ProductSubmissionModal from '@/components/ProductSubmissionModal';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { products, getTotalVotes } = useAdmin();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const totalVotes = getTotalVotes();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalVotes={totalVotes}
      />

      <main className="container mx-auto px-4 pt-32 pb-12">
        {/* Hero Section with Search and Brand Carousel */}
        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

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

        {/* Floating Suggest Product Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={() => setShowSubmissionModal(true)}
            className="gap-2 rounded-full shadow-lg h-12 px-5"
          >
            <Plus className="w-5 h-5" />
            {t.suggestProduct}
          </Button>
        </motion.div>

        <MissionPopup />

        {/* Product Submission Modal */}
        <ProductSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
        />
      </main>
    </div>
  );
};

export default Index;
