-- Update the handle_new_user function to handle case-insensitive admin email checking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN LOWER(NEW.email) = 'admin@farm.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;