-- Migration: Fill category_code for existing categories without codes
-- This migration generates unique category codes based on category_id for all categories that have NULL category_code

-- Step 1: Generate category_code for categories without codes
-- Using format 'CAT-{id}' to ensure uniqueness and readability
UPDATE jos_virtuemart_categories 
SET category_code = CONCAT('CAT-', virtuemart_category_id)
WHERE category_code IS NULL;

-- Verify the migration
-- SELECT COUNT(*) as total, 
--        SUM(CASE WHEN category_code IS NULL THEN 1 ELSE 0 END) as null_codes,
--        SUM(CASE WHEN category_code IS NOT NULL THEN 1 ELSE 0 END) as has_codes
-- FROM jos_virtuemart_categories;
