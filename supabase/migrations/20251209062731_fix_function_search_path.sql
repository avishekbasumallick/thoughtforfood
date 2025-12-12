/*
  # Fix Function Search Path Security Issue

  1. Function Security Fix
    - Set immutable search_path on `check_meals_per_date_limit()` function
    - Prevents potential search_path manipulation attacks
    - Explicitly sets search_path to 'public'
*/

-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION check_meals_per_date_limit()
RETURNS TRIGGER AS $$
DECLARE
  meal_count INTEGER;
BEGIN
  -- Count existing meals for this user and date
  SELECT COUNT(*)
  INTO meal_count
  FROM meals
  WHERE user_id = NEW.user_id
    AND meal_date = NEW.meal_date;
  
  -- Check if limit exceeded
  IF meal_count >= 10 THEN
    RAISE EXCEPTION 'You have reached the maximum limit of 10 meals per day for this date. Please choose a different date.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
