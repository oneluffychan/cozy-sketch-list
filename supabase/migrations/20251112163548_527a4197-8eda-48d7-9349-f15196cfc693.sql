-- Fix function search path security issue with CASCADE
DROP FUNCTION IF EXISTS update_updated_date_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_watchlist_updated_date
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();