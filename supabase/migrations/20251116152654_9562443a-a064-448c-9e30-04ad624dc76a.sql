-- Create custom_watchlists table
CREATE TABLE public.custom_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_watchlist_items table
CREATE TABLE public.custom_watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.custom_watchlists(id) ON DELETE CASCADE,
  anime_id INTEGER NOT NULL,
  anime_title TEXT NOT NULL,
  anime_image TEXT,
  anime_title_japanese TEXT,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_watchlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_watchlists
CREATE POLICY "Users can view their own watchlists"
  ON public.custom_watchlists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public watchlists"
  ON public.custom_watchlists
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own watchlists"
  ON public.custom_watchlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists"
  ON public.custom_watchlists
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists"
  ON public.custom_watchlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for custom_watchlist_items
CREATE POLICY "Users can view items in their own watchlists"
  ON public.custom_watchlist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_watchlists
      WHERE id = watchlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view items in public watchlists"
  ON public.custom_watchlist_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_watchlists
      WHERE id = watchlist_id AND is_public = true
    )
  );

CREATE POLICY "Users can add items to their own watchlists"
  ON public.custom_watchlist_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.custom_watchlists
      WHERE id = watchlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their own watchlists"
  ON public.custom_watchlist_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_watchlists
      WHERE id = watchlist_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their own watchlists"
  ON public.custom_watchlist_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_watchlists
      WHERE id = watchlist_id AND user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_custom_watchlists_updated_at
  BEFORE UPDATE ON public.custom_watchlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_date_column();