/*
  # Fix RLS Performance and Index Issues

  1. RLS Policy Optimization
    - Drop existing policies that re-evaluate auth.uid() for each row
    - Recreate policies with optimized `(select auth.uid())` pattern
    - This significantly improves query performance at scale by caching the auth.uid() result
    
  2. Index Cleanup
    - Drop unused single-column indexes on user_id and meal_date
    - Keep the composite index meals_user_date_idx which covers both columns efficiently
    - The composite index can serve queries on user_id alone or user_id + meal_date
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;

-- Recreate optimized RLS policies with (select auth.uid())
-- This prevents re-evaluation for each row, improving performance
CREATE POLICY "Users can view own meals"
  ON meals
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop unused indexes (composite index meals_user_date_idx is more efficient)
DROP INDEX IF EXISTS meals_user_id_idx;
DROP INDEX IF EXISTS meals_meal_date_idx;
