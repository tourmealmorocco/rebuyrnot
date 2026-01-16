import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/hooks/use-toast';

interface ProductSubmission {
  id: string;
  user_id: string | null;
  product_name: string;
  brand_name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
}

const SubmissionManager = () => {
  const { addProduct } = useAdmin();
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ProductSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchSubmissions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_submissions' },
        () => fetchSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else {
      setSubmissions(data as ProductSubmission[]);
    }
    setLoading(false);
  };

  const handleApprove = async (submission: ProductSubmission) => {
    try {
      // Create the product
      await addProduct({
        name: submission.product_name,
        brand: submission.brand_name,
        category: submission.category || 'tech',
        description: submission.description || '',
        image: submission.image_url || '/placeholder.svg',
        rebuyCount: 0,
        notCount: 0,
        recentVotes: 0,
        topRebuyReasons: [],
        topNotReasons: [],
        comments: [],
      });

      // Update submission status
      await supabase
        .from('product_submissions')
        .update({ status: 'approved', admin_notes: adminNotes || null })
        .eq('id', submission.id);

      toast({ title: 'Product approved and created!' });
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({ title: 'Error approving submission', variant: 'destructive' });
    }
  };

  const handleReject = async (submission: ProductSubmission) => {
    try {
      await supabase
        .from('product_submissions')
        .update({ status: 'rejected', admin_notes: adminNotes || null })
        .eq('id', submission.id);

      toast({ title: 'Submission rejected' });
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({ title: 'Error rejecting submission', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await supabase.from('product_submissions').delete().eq('id', id);
      toast({ title: 'Submission deleted' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({ title: 'Error deleting submission', variant: 'destructive' });
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Submissions</h2>
          <p className="text-muted-foreground">
            Review and approve user-submitted products
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount} pending</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.product_name}</TableCell>
                  <TableCell>{submission.brand_name}</TableCell>
                  <TableCell>{submission.category || '-'}</TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setAdminNotes(submission.admin_notes || '');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-success hover:text-success"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setAdminNotes('');
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setAdminNotes('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(submission.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Review and take action on this product submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium">{selectedSubmission.product_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{selectedSubmission.brand_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedSubmission.category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
              </div>

              {selectedSubmission.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{selectedSubmission.description}</p>
                </div>
              )}

              {selectedSubmission.image_url && (
                <div>
                  <p className="text-sm text-muted-foreground">Image</p>
                  <img 
                    src={selectedSubmission.image_url} 
                    alt={selectedSubmission.product_name}
                    className="w-full h-32 object-cover rounded-lg mt-1"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes (optional)..."
                  rows={2}
                />
              </div>

              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedSubmission)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleApprove(selectedSubmission)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SubmissionManager;
