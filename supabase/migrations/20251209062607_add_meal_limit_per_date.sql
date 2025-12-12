/*
  # Add 10 Meals Per Day Limit

  1. New Trigger Function
    - `check_meals_per_date_limit()` - Validates meal count before insert
    - Counts existing meals for the user and date
    - Raises an exception if user already has 10+ meals for that date
    
  2. Trigger
    - `enforce_meals_per_date_limit` - Fires before each INSERT on meals table
    - Calls the validation function
    - Prevents insert if limit is exceeded
    
  3. Security
    - Function is marked as SECURITY DEFINER to access all rows
    - Uses proper user_id and date filtering to prevent abuse
*/

-- Create function to check meal count limit
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs before insert
CREATE TRIGGER enforce_meals_per_date_limit
  BEFORE INSERT ON meals
  FOR EACH ROW
  EXECUTE FUNCTION check_meals_per_date_limit();
