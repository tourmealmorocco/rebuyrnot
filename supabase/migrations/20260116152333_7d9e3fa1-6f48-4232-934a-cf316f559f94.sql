-- Create product_submissions table for user-submitted product requests
CREATE TABLE public.product_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert submissions (users can submit product requests)
CREATE POLICY "Anyone can submit products" ON public.product_submissions
  FOR INSERT WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.product_submissions
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Only admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions" ON public.product_submissions
  FOR UPDATE USING (is_admin());

-- Only admins can delete submissions
CREATE POLICY "Admins can delete submissions" ON public.product_submissions
  FOR DELETE USING (is_admin());

-- Enable realtime for submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_submissions;

-- Create trigger for updated_at
CREATE TRIGGER update_product_submissions_updated_at
  BEFORE UPDATE ON public.product_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();