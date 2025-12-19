import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductById } from '@/data/products';
import ProductScoreDisplay from '@/components/ProductScoreDisplay';
import CommentModal from '@/components/CommentModal';
import { toast } from '@/hooks/use-toast';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const product = getProductById(id || '');
  
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'rebuy' | 'not' | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<'rebuy' | 'not' | null>(null);
  const [localCounts, setLocalCounts] = useState({
    rebuy: product?.rebuyCount || 0,
    not: product?.notCount || 0
  });

  useEffect(() => {
    if (product) {
      const voted = localStorage.getItem(`rebuyrnot-vote-${product.id}`);
      if (voted) {
        setHasVoted(true);
        setUserVote(voted as 'rebuy' | 'not');
      }
      setLocalCounts({
        rebuy: product.rebuyCount,
        not: product.notCount
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const totalVotes = localCounts.rebuy + localCounts.not;
  const rebuyPercent = totalVotes > 0 ? (localCounts.rebuy / totalVotes) * 100 : 50;

  const handleVoteClick = (vote: 'rebuy' | 'not') => {
    if (hasVoted) {
      toast({
        title: t.alreadyVoted,
        variant: 'destructive'
      });
      return;
    }
    setPendingVote(vote);
    setShowCommentModal(true);
  };

  const handleCommentSubmit = (comment: string) => {
    if (!pendingVote) return;
    
    // Save vote
    localStorage.setItem(`rebuyrnot-vote-${product.id}`, pendingVote);
    if (comment) {
      const comments = JSON.parse(localStorage.getItem(`rebuyrnot-comments-${product.id}`) || '[]');
      comments.push({ vote: pendingVote, text: comment, date: new Date().toISOString() });
      localStorage.setItem(`rebuyrnot-comments-${product.id}`, JSON.stringify(comments));
    }
    
    // Update local state
    setHasVoted(true);
    setUserVote(pendingVote);
    setLocalCounts(prev => ({
      rebuy: pendingVote === 'rebuy' ? prev.rebuy + 1 : prev.rebuy,
      not: pendingVote === 'not' ? prev.not + 1 : prev.not
    }));
    
    toast({
      title: t.thankYou,
      className: pendingVote === 'rebuy' ? 'border-success' : 'border-destructive'
    });
    
    setPendingVote(null);
  };

  const handleShare = () => {
    const text = `${product.brand} ${product.name}: ${rebuyPercent.toFixed(0)}% would rebuy! ${t.shareText}`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      toast({ title: 'Link copied!' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t.backToProducts}</span>
          </Link>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-12">
        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground mb-1">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">{product.description}</p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-8 mb-8"
        >
          <ProductScoreDisplay rebuyPercent={rebuyPercent} totalVotes={totalVotes} />
        </motion.div>

        {/* Vote Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-10"
        >
          <Button
            onClick={() => handleVoteClick('rebuy')}
            disabled={hasVoted}
            className={`flex-1 h-16 text-lg rounded-2xl gap-3 ${
              hasVoted && userVote === 'rebuy'
                ? 'bg-success text-success-foreground'
                : hasVoted
                ? 'opacity-50'
                : 'bg-success hover:bg-success/90 text-success-foreground'
            }`}
          >
            <Check className="h-6 w-6" />
            {t.idRebuy}
          </Button>
          <Button
            onClick={() => handleVoteClick('not')}
            disabled={hasVoted}
            className={`flex-1 h-16 text-lg rounded-2xl gap-3 ${
              hasVoted && userVote === 'not'
                ? 'bg-destructive text-destructive-foreground'
                : hasVoted
                ? 'opacity-50'
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            }`}
          >
            <X className="h-6 w-6" />
            {t.notAgain}
          </Button>
        </motion.div>

        {/* Top Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Rebuy Reasons */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              {t.topReasonsRebuy}
            </h3>
            <ul className="space-y-3">
              {product.topRebuyReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-success font-bold">{index + 1}.</span>
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Reasons */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              {t.topReasonsNot}
            </h3>
            <ul className="space-y-3">
              {product.topNotReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-destructive font-bold">{index + 1}.</span>
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setPendingVote(null);
        }}
        onSubmit={handleCommentSubmit}
        vote={pendingVote || 'rebuy'}
      />
    </div>
  );
};

export default ProductPage;
