-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update trigger function to sync email AND full_name from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user signs up, create a profile with their email and full_name
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with full_name from auth.users metadata
UPDATE profiles p
SET full_name = COALESCE(
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'name',
  p.full_name
)
FROM auth.users u
WHERE p.id = u.id 
  AND (p.full_name IS NULL OR p.full_name = '');

-- Create index for avatar_url
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);

COMMENT ON COLUMN profiles.avatar_url IS 'User avatar/profile picture URL';
