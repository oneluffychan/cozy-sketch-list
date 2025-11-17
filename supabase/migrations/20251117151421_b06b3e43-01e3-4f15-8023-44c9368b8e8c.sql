-- Fix the update function to use correct column name
DROP FUNCTION IF EXISTS public.update_updated_date_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate trigger for custom_watchlists if it exists
DROP TRIGGER IF EXISTS update_custom_watchlists_updated_at ON public.custom_watchlists;

CREATE TRIGGER update_custom_watchlists_updated_at
BEFORE UPDATE ON public.custom_watchlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();