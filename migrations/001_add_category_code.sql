-- Migration: Add category_code field to categories
-- Description: Adds unique category code field for better category identification
-- Date: 2026-11-06

-- Add category_code column to jos_virtuemart_categories
ALTER TABLE jos_virtuemart_categories 
ADD COLUMN category_code VARCHAR(50) DEFAULT NULL AFTER virtuemart_vendor_id;

-- Add index for category_code
ALTER TABLE jos_virtuemart_categories 
ADD UNIQUE INDEX uk_category_code (category_code);

-- Note: Existing categories will have NULL category_code
-- Admin should populate this field for existing categories
