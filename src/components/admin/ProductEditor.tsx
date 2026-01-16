import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/data/products';
import { toast } from '@/hooks/use-toast';

interface ProductEditorProps {
  product: Product | null;
  onClose: () => void;
}

const ProductEditor = ({ product, onClose }: ProductEditorProps) => {
  const { addProduct, updateProduct } = useAdmin();
  const { categories, loading: categoriesLoading } = useCategories();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || 'tech',
    image: product?.image || '',
    description: product?.description || '',
    rebuyCount: product?.rebuyCount || 0,
    notCount: product?.notCount || 0,
    recentVotes: product?.recentVotes || 0,
    topRebuyReasons: product?.topRebuyReasons || ['', '', ''],
    topNotReasons: product?.topNotReasons || ['', '', ''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    const productData = {
      ...formData,
      topRebuyReasons: formData.topRebuyReasons.filter(r => r.trim()),
      topNotReasons: formData.topNotReasons.filter(r => r.trim()),
      comments: product?.comments || [],
    };

    if (isEditing && product) {
      updateProduct(product.id, productData);
      toast({ title: 'Product updated successfully' });
    } else {
      addProduct(productData as Omit<Product, 'id'>);
      toast({ title: 'Product created successfully' });
    }
    onClose();
  };

  const updateReason = (type: 'rebuy' | 'not', index: number, value: string) => {
    const key = type === 'rebuy' ? 'topRebuyReasons' : 'topNotReasons';
    const newReasons = [...formData[key]];
    newReasons[index] = value;
    setFormData({ ...formData, [key]: newReasons });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit Product' : 'Create New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. iPhone 15 Pro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Apple"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.key}>
                    {cat.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Product description..."
            rows={3}
          />
        </div>

        {/* Vote Counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rebuyCount">Rebuy Count</Label>
            <Input
              id="rebuyCount"
              type="number"
              value={formData.rebuyCount}
              onChange={(e) => setFormData({ ...formData, rebuyCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notCount">Not Count</Label>
            <Input
              id="notCount"
              type="number"
              value={formData.notCount}
              onChange={(e) => setFormData({ ...formData, notCount: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recentVotes">Recent Votes</Label>
            <Input
              id="recentVotes"
              type="number"
              value={formData.recentVotes}
              onChange={(e) => setFormData({ ...formData, recentVotes: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Top Rebuy Reasons
            </Label>
            {formData.topRebuyReasons.map((reason, index) => (
              <Input
                key={index}
                value={reason}
                onChange={(e) => updateReason('rebuy', index, e.target.value)}
                placeholder={`Reason ${index + 1}`}
              />
            ))}
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Top Not Reasons
            </Label>
            {formData.topNotReasons.map((reason, index) => (
              <Input
                key={index}
                value={reason}
                onChange={(e) => updateReason('not', index, e.target.value)}
                placeholder={`Reason ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductEditor;
