-- Update customer_records table to support decimal values
ALTER TABLE customer_records 
  ALTER COLUMN acres TYPE NUMERIC,
  ALTER COLUMN cost TYPE NUMERIC,
  ALTER COLUMN total TYPE NUMERIC,
  ALTER COLUMN discount TYPE NUMERIC;

-- Update harvestor_records table to support decimal values  
ALTER TABLE harvestor_records
  ALTER COLUMN acres TYPE NUMERIC,
  ALTER COLUMN cost TYPE NUMERIC,
  ALTER COLUMN total TYPE NUMERIC,
  ALTER COLUMN discount TYPE NUMERIC;

-- Update trailer_records table to support decimal values
ALTER TABLE trailer_records
  ALTER COLUMN cost TYPE NUMERIC,
  ALTER COLUMN total TYPE NUMERIC,
  ALTER COLUMN discount TYPE NUMERIC,
  ALTER COLUMN no_of_trips TYPE NUMERIC;

-- Update expenses table to support decimal values
ALTER TABLE expenses
  ALTER COLUMN amount TYPE NUMERIC;

-- Update miscellaneous table to support decimal values  
ALTER TABLE miscellaneous
  ALTER COLUMN amount TYPE NUMERIC;