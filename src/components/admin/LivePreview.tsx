import { useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LivePreview = () => {
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-secondary/30">
      {/* Header */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <span className="text-sm font-medium">Live Preview</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('/', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 p-4">
        <div className="h-full rounded-lg overflow-hidden border border-border bg-background">
          <iframe
            key={key}
            src="/"
            className="w-full h-full"
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
