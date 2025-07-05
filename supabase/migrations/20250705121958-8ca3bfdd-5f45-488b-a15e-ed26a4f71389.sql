-- Add paid column to harvestor_records table
ALTER TABLE harvestor_records ADD COLUMN paid BOOLEAN DEFAULT false;