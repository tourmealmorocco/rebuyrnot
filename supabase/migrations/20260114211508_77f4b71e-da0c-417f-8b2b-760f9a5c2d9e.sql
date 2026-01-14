-- Fix 1: Add input validation to record_vote_attempt() function
CREATE OR REPLACE FUNCTION public.record_vote_attempt(_fingerprint TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input
  IF _fingerprint IS NULL OR length(_fingerprint) = 0 THEN
    RAISE EXCEPTION 'Fingerprint cannot be empty';
  END IF;
  
  IF length(_fingerprint) > 255 THEN
    RAISE EXCEPTION 'Fingerprint too long (max 255 characters)';
  END IF;
  
  -- Only allow alphanumeric, dash, and underscore
  IF _fingerprint !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Invalid fingerprint format';
  END IF;
  
  INSERT INTO public.vote_rate_limits (user_fingerprint)
  VALUES (_fingerprint);
END;
$$;

-- Fix 2: Add validation to check_vote_rate_limit() as well
CREATE OR REPLACE FUNCTION public.check_vote_rate_limit(_fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input
  IF _fingerprint IS NULL OR length(_fingerprint) = 0 THEN
    RETURN false;
  END IF;
  
  IF length(_fingerprint) > 255 THEN
    RETURN false;
  END IF;
  
  -- Only allow alphanumeric, dash, and underscore
  IF _fingerprint !~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN false;
  END IF;
  
  RETURN (
    SELECT COUNT(*) < 10
    FROM public.vote_rate_limits
    WHERE user_fingerprint = _fingerprint
      AND created_at > now() - INTERVAL '1 hour'
  );
END;
$$;

-- Fix 3: Remove public read access to vote_rate_limits table
DROP POLICY IF EXISTS "Anyone can read rate limits" ON public.vote_rate_limits;

-- Add admin-only read access (SECURITY DEFINER functions bypass RLS anyway)
CREATE POLICY "Admins can read rate limits"
ON public.vote_rate_limits
FOR SELECT
TO authenticated
USING (public.is_admin());