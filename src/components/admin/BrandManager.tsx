import { useState } from 'react';
import { useBrands, Brand } from '@/hooks/useBrands';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const BrandManager = () => {
  const { brands, addBrand, updateBrand, deleteBrand, loading } = useBrands();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({ name: '', logo_url: '', display_order: 0, is_active: true });
    setEditingBrand(null);
  };

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        logo_url: brand.logo_url,
        display_order: brand.display_order,
        is_active: brand.is_active,
      });
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, display_order: brands.length }));
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
        toast.success('Brand updated successfully');
      } else {
        await addBrand(formData);
        toast.success('Brand added successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await deleteBrand(id);
      toast.success('Brand deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete brand');
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      await updateBrand(brand.id, { is_active: !brand.is_active });
      toast.success(`Brand ${brand.is_active ? 'hidden' : 'shown'}`);
    } catch (error) {
      toast.error('Failed to update brand');
    }
  };

  if (loading) {
    return <div className="p-6">Loading brands...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Brands</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  required
                />
              </div>
              {formData.logo_url && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <Label className="mb-2 block">Preview</Label>
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
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
                  {editingBrand ? 'Update' : 'Add'} Brand
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {brands.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No brands yet. Add your first brand to display in the carousel.
            </CardContent>
          </Card>
        ) : (
          brands.map((brand) => (
            <Card key={brand.id} className={!brand.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-10 w-20 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{brand.name}</p>
                  <p className="text-sm text-muted-foreground">Order: {brand.display_order}</p>
                </div>
                <Switch
                  checked={brand.is_active}
                  onCheckedChange={() => handleToggleActive(brand)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(brand)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}>
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

export default BrandManager;
