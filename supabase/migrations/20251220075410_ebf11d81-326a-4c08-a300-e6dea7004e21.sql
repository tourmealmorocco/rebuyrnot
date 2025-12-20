-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Drop existing overly permissive policies on products
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;

-- Create admin-only policies for products modifications
CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Drop existing overly permissive policy on comments
DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;

-- Create admin-only delete policy for comments
CREATE POLICY "Only admins can delete comments"
ON public.comments
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Add rate limiting table to track vote attempts
CREATE TABLE public.vote_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fingerprint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.vote_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow inserting rate limit records
CREATE POLICY "Anyone can insert rate limits"
ON public.vote_rate_limits
FOR INSERT
WITH CHECK (true);

-- Allow reading rate limits
CREATE POLICY "Anyone can read rate limits"
ON public.vote_rate_limits
FOR SELECT
USING (true);

-- Create function to check rate limit (max 10 votes per fingerprint per hour)
CREATE OR REPLACE FUNCTION public.check_vote_rate_limit(_fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.vote_rate_limits
    WHERE user_fingerprint = _fingerprint
      AND created_at > now() - INTERVAL '1 hour'
  ) < 10
$$;

-- Create function to record vote attempt
CREATE OR REPLACE FUNCTION public.record_vote_attempt(_fingerprint TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.vote_rate_limits (user_fingerprint)
  VALUES (_fingerprint);
$$;

-- Update user_votes insert policy to include rate limiting
DROP POLICY IF EXISTS "Anyone can insert user_votes" ON public.user_votes;

CREATE POLICY "Rate limited vote insertion"
ON public.user_votes
FOR INSERT
WITH CHECK (public.check_vote_rate_limit(user_fingerprint));

-- Create index for efficient rate limit queries
CREATE INDEX idx_vote_rate_limits_fingerprint_time 
ON public.vote_rate_limits (user_fingerprint, created_at DESC);

-- Clean up old rate limit entries (keep last 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.vote_rate_limits
  WHERE created_at < now() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$;

-- Trigger to cleanup old entries on insert
CREATE TRIGGER cleanup_rate_limits_trigger
AFTER INSERT ON public.vote_rate_limits
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_rate_limits();