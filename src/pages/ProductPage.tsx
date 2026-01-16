import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Share2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import ProductScoreDisplay from '@/components/ProductScoreDisplay';
import ScoreBar from '@/components/ScoreBar';
import CommentModal from '@/components/CommentModal';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import NameInputModal from '@/components/NameInputModal';
import { toast } from '@/hooks/use-toast';
import { logger, validateComment } from '@/lib/logger';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { getProductById, loading } = useAdmin();
  const { user, loading: authLoading, isProfileComplete } = useUser();
  const product = getProductById(id || '');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<'rebuy' | 'not' | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<'rebuy' | 'not' | null>(null);
  const [localCounts, setLocalCounts] = useState({ rebuy: 0, not: 0 });
  const [checkingVote, setCheckingVote] = useState(true);

  // Persist pending vote across OAuth redirect
  const savePendingVote = (vote: 'rebuy' | 'not') => {
    sessionStorage.setItem('pendingVote', JSON.stringify({ productId: id, voteType: vote }));
  };

  const clearPendingVote = () => {
    sessionStorage.removeItem('pendingVote');
  };

  // Restore pending vote after OAuth redirect
  useEffect(() => {
    if (authLoading) return;
    
    const savedVoteStr = sessionStorage.getItem('pendingVote');
    if (savedVoteStr && user) {
      try {
        const savedVote = JSON.parse(savedVoteStr);
        if (savedVote.productId === id) {
          setPendingVote(savedVote.voteType);
          clearPendingVote();
          
          // Continue the flow based on profile status
          if (!isProfileComplete) {
            setShowNameModal(true);
          } else {
            setShowCommentModal(true);
          }
        }
      } catch (e) {
        clearPendingVote();
      }
    }
  }, [authLoading, user, id, isProfileComplete]);

  // Check if user has already voted (using user_id)
  useEffect(() => {
    const checkUserVote = async () => {
      if (!id || !user) {
        setCheckingVote(false);
        return;
      }
      
      const { data } = await supabase
        .from('user_votes')
        .select('vote_type')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setHasVoted(true);
        setUserVote(data.vote_type as 'rebuy' | 'not');
      } else {
        setHasVoted(false);
        setUserVote(null);
      }
      setCheckingVote(false);
    };

    checkUserVote();
  }, [id, user]);

  // Update local counts when product changes
  useEffect(() => {
    if (product) {
      setLocalCounts({
        rebuy: product.rebuyCount,
        not: product.notCount
      });
    }
  }, [product]);


  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

    // Check authentication flow
    if (!user) {
      savePendingVote(vote); // Persist before OAuth redirect
      setShowSignInModal(true);
      return;
    }

    if (!isProfileComplete) {
      setShowNameModal(true);
      return;
    }

    setShowCommentModal(true);
  };

  const handleNameSuccess = () => {
    setShowNameModal(false);
    if (pendingVote) {
      setShowCommentModal(true);
    }
  };

  const handleCommentSubmit = async (comment: string) => {
    if (!pendingVote || !id || !user) return;

    try {
      // Insert vote with user_id
      const { error: voteError } = await supabase.from('user_votes').insert({
        product_id: id,
        user_id: user.id,
        user_fingerprint: user.id, // Use user.id as fingerprint for backwards compatibility
        vote_type: pendingVote
      });

      if (voteError) {
        if (voteError.code === '23505') {
          toast({ title: t.alreadyVoted, variant: 'destructive' });
          return;
        }
        throw voteError;
      }

      // Update product vote count
      const updates = pendingVote === 'rebuy'
        ? { rebuy_votes: localCounts.rebuy + 1 }
        : { not_votes: localCounts.not + 1 };

      await supabase.from('products').update(updates).eq('id', id);

      // Add comment if provided (with validation)
      if (comment) {
        const commentError = validateComment(comment);
        if (commentError) {
          toast({ title: commentError, variant: 'destructive' });
          return;
        }
        
        await supabase.from('comments').insert({
          product_id: id,
          vote_type: pendingVote,
          text: comment.trim()
        });
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
    } catch (error) {
      logger.error('Error submitting vote:', error);
      toast({ title: 'Error submitting vote', variant: 'destructive' });
    }

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

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'عر' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-5 w-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              Rebuy<span className="text-success">R</span>not
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-1"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-secondary transition-colors ${
                        language === lang.code ? 'bg-secondary' : ''
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-48 sm:h-56 md:h-72 overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-10 sm:-mt-14 relative z-10 pb-6 sm:pb-10">
        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6"
        >
          <p className="text-muted-foreground text-sm mb-1">{product.brand}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{product.name}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto px-2 line-clamp-2">{product.description}</p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <ProductScoreDisplay rebuyPercent={rebuyPercent} totalVotes={totalVotes} />
          <div className="mt-4">
            <ScoreBar rebuyPercent={rebuyPercent} totalVotes={totalVotes} />
          </div>
        </motion.div>

        {/* Vote Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          <Button
            onClick={() => handleVoteClick('rebuy')}
            disabled={hasVoted}
            className={`flex-1 h-12 sm:h-14 text-base rounded-xl gap-2 ${
              hasVoted && userVote === 'rebuy'
                ? 'bg-success text-success-foreground'
                : hasVoted
                ? 'opacity-50'
                : 'bg-success hover:bg-success/90 text-success-foreground'
            }`}
          >
            <Check className="h-5 w-5" />
            {t.idRebuy}
          </Button>
          <Button
            onClick={() => handleVoteClick('not')}
            disabled={hasVoted}
            className={`flex-1 h-12 sm:h-14 text-base rounded-xl gap-2 ${
              hasVoted && userVote === 'not'
                ? 'bg-destructive text-destructive-foreground'
                : hasVoted
                ? 'opacity-50'
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            }`}
          >
            <X className="h-5 w-5" />
            {t.notAgain}
          </Button>
        </motion.div>

        {/* Top Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Rebuy Reasons */}
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success" />
              {t.topReasonsRebuy}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {product.topRebuyReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <span className="text-success font-bold text-sm sm:text-base">{index + 1}.</span>
                  <span className="text-muted-foreground text-sm sm:text-base">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Reasons */}
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-destructive" />
              {t.topReasonsNot}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {product.topNotReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <span className="text-destructive font-bold text-sm sm:text-base">{index + 1}.</span>
                  <span className="text-muted-foreground text-sm sm:text-base">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={showSignInModal}
        onClose={() => {
          setShowSignInModal(false);
          setPendingVote(null);
          clearPendingVote();
        }}
      />

      {/* Name Input Modal */}
      <NameInputModal
        isOpen={showNameModal}
        onClose={() => {
          setShowNameModal(false);
          setPendingVote(null);
        }}
        onSuccess={handleNameSuccess}
      />

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
