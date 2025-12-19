import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Plus, Eye, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductManager from '@/components/admin/ProductManager';
import ProductEditor from '@/components/admin/ProductEditor';
import LivePreview from '@/components/admin/LivePreview';
import { Product } from '@/data/products';

type View = 'products' | 'settings';

const Admin = () => {
  const { isAuthenticated, logout } = useAdmin();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsCreating(false);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsCreating(true);
  };

  const handleCloseEditor = () => {
    setEditingProduct(null);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">
            {currentView === 'products' ? 'Product Management' : 'Settings'}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className={`flex-1 p-6 overflow-auto ${showPreview ? 'w-1/2' : 'w-full'}`}>
            {currentView === 'products' && (
              <>
                {(editingProduct || isCreating) ? (
                  <ProductEditor
                    product={editingProduct}
                    onClose={handleCloseEditor}
                  />
                ) : (
                  <ProductManager
                    onEdit={handleEditProduct}
                    onCreate={handleCreateProduct}
                  />
                )}
              </>
            )}
            {currentView === 'settings' && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                <p className="text-muted-foreground">
                  Settings panel coming soon. You can manage products from the Products section.
                </p>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="w-1/2 border-l border-border">
              <LivePreview />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
