-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create or replace trigger function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user signs up, create a profile with their email
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_email ON auth.users;

-- Create trigger to sync email when user is created
CREATE TRIGGER on_auth_user_created_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_email();

-- Update existing profiles with emails from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

COMMENT ON COLUMN profiles.email IS 'User email synced from auth.users';
