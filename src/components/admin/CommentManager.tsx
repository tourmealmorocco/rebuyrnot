import { useState, useMemo } from 'react';
import { MessageSquare, Trash2, Filter, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import { useComments } from '@/hooks/useProducts';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const CommentManager = () => {
  const { products } = useAdmin();
  const { comments, loading, deleteComment, refetch } = useComments();
  const [productFilter, setProductFilter] = useState<string>('all');
  const [voteFilter, setVoteFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Apply filters and sorting
  const filteredComments = useMemo(() => {
    let result = [...comments];
    
    // Filter by product
    if (productFilter !== 'all') {
      result = result.filter(c => c.productId === productFilter);
    }
    
    // Filter by vote type
    if (voteFilter !== 'all') {
      result = result.filter(c => c.vote === voteFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [comments, productFilter, voteFilter, sortOrder]);

  // Stats
  const stats = useMemo(() => ({
    total: comments.length,
    rebuy: comments.filter(c => c.vote === 'rebuy').length,
    not: comments.filter(c => c.vote === 'not').length
  }), [comments]);

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);
      toast({ title: 'Comment deleted' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ title: 'Error deleting comment', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Comments Management</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Comments</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.rebuy}</p>
          <p className="text-sm text-muted-foreground">Rebuy Comments</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.not}</p>
          <p className="text-sm text-muted-foreground">Not Comments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.brand} {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={voteFilter} onValueChange={setVoteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Votes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Votes</SelectItem>
              <SelectItem value="rebuy">Rebuy Only</SelectItem>
              <SelectItem value="not">Not Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No comments found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comments will appear here when users vote and leave feedback
            </p>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
            >
              {/* Vote Indicator */}
              <div className={`p-2 rounded-full ${
                comment.vote === 'rebuy' ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {comment.vote === 'rebuy' ? (
                  <ThumbsUp className="w-5 h-5 text-success" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-destructive" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.productBrand} {comment.productName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    comment.vote === 'rebuy' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {comment.vote === 'rebuy' ? 'Would Rebuy' : 'Would Not'}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{comment.text}</p>
                <p className="text-xs text-muted-foreground">{formatDate(comment.date)}</p>
              </div>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteComment(comment.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentManager;
