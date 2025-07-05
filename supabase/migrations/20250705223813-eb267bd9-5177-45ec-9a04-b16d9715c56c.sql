-- Create trailer_records table
CREATE TABLE public.trailer_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  no_of_trips INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trailer_records ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Public access to trailer_records" 
ON public.trailer_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trailer_records_updated_at
BEFORE UPDATE ON public.trailer_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();