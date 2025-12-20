-- Create products table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  rebuy_votes INTEGER DEFAULT 0,
  not_votes INTEGER DEFAULT 0,
  description TEXT,
  rebuy_reasons TEXT[] DEFAULT '{}',
  not_reasons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('rebuy', 'not')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_votes table for tracking votes (prevents double voting)
CREATE TABLE public.user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_fingerprint TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('rebuy', 'not')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_fingerprint)
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- Products: Public read access
CREATE POLICY "Anyone can read products"
ON public.products FOR SELECT
USING (true);

-- Products: Public insert/update/delete (admin controlled via app logic)
CREATE POLICY "Anyone can insert products"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products FOR DELETE
USING (true);

-- Comments: Public read access
CREATE POLICY "Anyone can read comments"
ON public.comments FOR SELECT
USING (true);

-- Comments: Public insert
CREATE POLICY "Anyone can insert comments"
ON public.comments FOR INSERT
WITH CHECK (true);

-- Comments: Public delete (admin controlled via app logic)
CREATE POLICY "Anyone can delete comments"
ON public.comments FOR DELETE
USING (true);

-- User votes: Public read
CREATE POLICY "Anyone can read user_votes"
ON public.user_votes FOR SELECT
USING (true);

-- User votes: Public insert
CREATE POLICY "Anyone can insert user_votes"
ON public.user_votes FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_votes;