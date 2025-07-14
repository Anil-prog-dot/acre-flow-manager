-- Add description column to customer_records table
ALTER TABLE public.customer_records 
ADD COLUMN description TEXT DEFAULT '';

-- Add description column to harvestor_records table  
ALTER TABLE public.harvestor_records 
ADD COLUMN description TEXT DEFAULT '';

-- Add description column to trailer_records table
ALTER TABLE public.trailer_records 
ADD COLUMN description TEXT DEFAULT '';