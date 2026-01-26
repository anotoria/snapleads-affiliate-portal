-- Update handle_new_user trigger to capture company_name and phone from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, company_name, phone, affiliate_code)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'phone',
        'ref_' || substring(NEW.id::text, 1, 8)
    );
    RETURN NEW;
END;
$$;