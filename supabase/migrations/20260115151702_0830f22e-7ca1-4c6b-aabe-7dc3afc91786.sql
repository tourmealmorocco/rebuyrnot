-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

-- Users can insert their own profile (for cases where trigger doesn't fire)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update user_votes table: add user_id column
ALTER TABLE public.user_votes ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop old RLS policies on user_votes
DROP POLICY IF EXISTS "Anyone can read user_votes" ON public.user_votes;
DROP POLICY IF EXISTS "Rate limited vote insertion" ON public.user_votes;

-- Create new RLS policies for authenticated voting
CREATE POLICY "Users can read own votes" ON public.user_votes
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can insert votes" ON public.user_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime on profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;