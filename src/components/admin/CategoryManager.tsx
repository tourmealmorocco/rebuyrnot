import { useState } from 'react';
import { useCategories, Category } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    name_en: '',
    name_fr: '',
    name_ar: '',
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({ key: '', name_en: '', name_fr: '', name_ar: '', display_order: 0, is_active: true });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        key: category.key,
        name_en: category.name_en,
        name_fr: category.name_fr,
        name_ar: category.name_ar,
        display_order: category.display_order,
        is_active: category.is_active,
      });
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, display_order: categories.length }));
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await addCategory(formData);
        toast.success('Category added successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (key === 'all') {
      toast.error('Cannot delete the "All" category');
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: Category) => {
    if (category.key === 'all') {
      toast.error('Cannot hide the "All" category');
      return;
    }
    try {
      await updateCategory(category.id, { is_active: !category.is_active });
      toast.success(`Category ${category.is_active ? 'hidden' : 'shown'}`);
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  if (loading) {
    return <div className="p-6">Loading categories...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">Key (unique identifier)</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                  placeholder="e.g., electronics"
                  required
                  disabled={!!editingCategory}
                />
              </div>
              <div>
                <Label htmlFor="name_en">English Name</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_fr">French Name</Label>
                <Input
                  id="name_fr"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ar">Arabic Name</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  dir="rtl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible on website)</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No categories yet. Add your first category.
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className={!category.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <p className="font-medium">{category.name_en}</p>
                  <p className="text-sm text-muted-foreground">
                    Key: {category.key} | FR: {category.name_fr} | AR: {category.name_ar}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">#{category.display_order}</span>
                <Switch
                  checked={category.is_active}
                  onCheckedChange={() => handleToggleActive(category)}
                  disabled={category.key === 'all'}
                />
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(category.id, category.key)}
                  disabled={category.key === 'all'}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
