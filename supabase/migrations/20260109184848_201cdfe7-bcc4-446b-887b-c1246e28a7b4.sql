-- Create brands table for logo carousel
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for brands
CREATE POLICY "Anyone can read active brands"
ON public.brands
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert brands"
ON public.brands
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update brands"
ON public.brands
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can delete brands"
ON public.brands
FOR DELETE
USING (is_admin());

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Anyone can read categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert categories"
ON public.categories
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update categories"
ON public.categories
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can delete categories"
ON public.categories
FOR DELETE
USING (is_admin());

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.brands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- Insert default categories
INSERT INTO public.categories (key, name_en, name_fr, name_ar, display_order) VALUES
('all', 'All', 'Tous', 'الكل', 0),
('cars', 'Cars', 'Voitures', 'سيارات', 1),
('tech', 'Tech', 'Tech', 'تكنولوجيا', 2),
('beauty', 'Beauty', 'Beauté', 'جمال', 3),
('fashion', 'Fashion', 'Mode', 'موضة', 4),
('home', 'Home', 'Maison', 'منزل', 5);