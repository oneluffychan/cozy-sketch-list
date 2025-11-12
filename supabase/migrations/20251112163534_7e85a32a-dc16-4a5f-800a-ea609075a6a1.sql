-- Create watchlist table for storing user's anime lists
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  anime_title TEXT NOT NULL,
  anime_image TEXT,
  anime_title_japanese TEXT,
  status TEXT NOT NULL CHECK (status IN ('watch_later', 'watching', 'completed')),
  episodes_watched INTEGER DEFAULT 0,
  total_episodes INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  added_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

-- Enable RLS
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Users can only view their own watchlist
CREATE POLICY "Users can view their own watchlist"
ON public.watchlist
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert into their own watchlist
CREATE POLICY "Users can insert into their own watchlist"
ON public.watchlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist
CREATE POLICY "Users can update their own watchlist"
ON public.watchlist
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete from their own watchlist
CREATE POLICY "Users can delete from their own watchlist"
ON public.watchlist
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON public.watchlist(status);

-- Trigger to update updated_date
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_watchlist_updated_date
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION update_updated_date_column();