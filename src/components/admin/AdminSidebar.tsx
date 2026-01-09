import { Package, Settings, Home, MessageSquare, Image, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  currentView: 'products' | 'settings' | 'comments' | 'brands' | 'categories';
  onViewChange: (view: 'products' | 'settings' | 'comments' | 'brands' | 'categories') => void;
}

const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'brands' as const, label: 'Brands', icon: Image },
    { id: 'categories' as const, label: 'Categories', icon: Tag },
    { id: 'comments' as const, label: 'Comments', icon: MessageSquare },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b border-border flex items-center px-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80">
          <span className="text-lg font-bold tracking-tight">
            Rebuy<span className="text-success">R</span>not
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">View Site</span>
        </Link>
        
        <div className="my-4 border-t border-border" />
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              currentView === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Admin Panel v1.0
        </p>
      </div>
    </div>
  );
};

export default AdminSidebar;
