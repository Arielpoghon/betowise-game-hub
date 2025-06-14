
-- Add columns to matches table to support fixed outcomes
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS fixed_home_score integer,
ADD COLUMN IF NOT EXISTS fixed_away_score integer,
ADD COLUMN IF NOT EXISTS is_fixed_match boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fixed_outcome_set boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create a table to track fixed match outcomes and betting
CREATE TABLE IF NOT EXISTS public.fixed_match_outcomes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches(id) NOT NULL,
  predicted_home_score integer NOT NULL,
  predicted_away_score integer NOT NULL,
  actual_home_score integer,
  actual_away_score integer,
  outcome_delivered boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.fixed_match_outcomes ENABLE ROW LEVEL SECURITY;

-- Create policies for fixed match outcomes (admin can manage all, users can view)
CREATE POLICY "Anyone can view fixed match outcomes" 
  ON public.fixed_match_outcomes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert fixed match outcomes" 
  ON public.fixed_match_outcomes 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fixed match outcomes" 
  ON public.fixed_match_outcomes 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create function to automatically finish matches with fixed outcomes
CREATE OR REPLACE FUNCTION public.finish_fixed_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update live fixed matches that should be finished
  UPDATE public.matches 
  SET 
    status = 'finished',
    home_score = fixed_home_score,
    away_score = fixed_away_score,
    finished_at = now(),
    updated_at = now()
  WHERE 
    status = 'live' 
    AND is_fixed_match = true 
    AND fixed_outcome_set = true
    AND (
      -- Finish after 95 minutes for soccer (90 + 5 stoppage time)
      (sport = 'Soccer' AND current_minute >= 95) OR
      -- Finish after 50 minutes for basketball (48 + 2 overtime buffer)  
      (sport = 'Basketball' AND current_minute >= 50) OR
      -- Finish after 90 minutes for rugby
      (sport = 'Rugby' AND current_minute >= 90) OR
      -- Default: finish after 95 minutes for other sports
      (sport NOT IN ('Soccer', 'Basketball', 'Rugby') AND current_minute >= 95)
    );

  -- Update the fixed match outcomes table
  UPDATE public.fixed_match_outcomes 
  SET 
    actual_home_score = m.home_score,
    actual_away_score = m.away_score,
    outcome_delivered = true,
    updated_at = now()
  FROM public.matches m
  WHERE 
    fixed_match_outcomes.match_id = m.id 
    AND m.status = 'finished' 
    AND m.is_fixed_match = true
    AND fixed_match_outcomes.outcome_delivered = false;
END;
$$;

-- Create trigger to automatically update timestamps
CREATE OR REPLACE TRIGGER update_fixed_match_outcomes_updated_at
  BEFORE UPDATE ON public.fixed_match_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
