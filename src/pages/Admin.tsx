import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductManager from '@/components/admin/ProductManager';
import ProductEditor from '@/components/admin/ProductEditor';
import LivePreview from '@/components/admin/LivePreview';
import CommentManager from '@/components/admin/CommentManager';
import BrandManager from '@/components/admin/BrandManager';
import CategoryManager from '@/components/admin/CategoryManager';
import ContentManager from '@/components/admin/ContentManager';
import { Product } from '@/data/products';

type View = 'products' | 'settings' | 'comments' | 'brands' | 'categories' | 'content';

const Admin = () => {
  const { isAuthenticated, isAdmin, logout, loading, user } = useAdmin();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show not authenticated message
  if (!isAuthenticated) {
    return null;
  }

  // Show not admin message
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">
            You don't have admin privileges. Please contact an administrator to request access.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Signed in as: {user?.email}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
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
            {currentView === 'products' ? 'Product Management' : 
             currentView === 'comments' ? 'Comments Management' : 
             currentView === 'brands' ? 'Brands Management' :
             currentView === 'categories' ? 'Categories Management' :
             currentView === 'content' ? 'Content & Translations' : 'Settings'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
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
            {currentView === 'comments' && (
              <CommentManager />
            )}
            {currentView === 'brands' && (
              <BrandManager />
            )}
            {currentView === 'categories' && (
              <CategoryManager />
            )}
            {currentView === 'content' && (
              <ContentManager />
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
