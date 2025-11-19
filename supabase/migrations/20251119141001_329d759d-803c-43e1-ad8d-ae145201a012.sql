-- Create saved_watchlists table for users to star/save watchlists
CREATE TABLE public.saved_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  watchlist_id UUID NOT NULL REFERENCES public.custom_watchlists(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, watchlist_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_watchlists ENABLE ROW LEVEL SECURITY;

-- Users can save watchlists
CREATE POLICY "Users can save watchlists"
ON public.saved_watchlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unsave watchlists
CREATE POLICY "Users can unsave watchlists"
ON public.saved_watchlists
FOR DELETE
USING (auth.uid() = user_id);

-- Users can view their saved watchlists
CREATE POLICY "Users can view their saved watchlists"
ON public.saved_watchlists
FOR SELECT
USING (auth.uid() = user_id);