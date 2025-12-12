/*
  # Create meals table for ThoughtForFood app

  1. New Tables
    - `meals`
      - `id` (uuid, primary key) - Unique identifier for each meal
      - `user_id` (uuid, foreign key) - References auth.users
      - `meal_description` (text) - Natural language description of the meal
      - `meal_date` (date) - Date the meal was consumed
      - `calories` (decimal) - Energy in kcal
      - `total_fat` (decimal) - Total fat in grams
      - `saturated_fat` (decimal) - Saturated fat in grams
      - `trans_fat` (decimal) - Trans fat in grams
      - `cholesterol` (decimal) - Cholesterol in milligrams
      - `sodium` (decimal) - Sodium in milligrams
      - `total_carbohydrates` (decimal) - Total carbs in grams
      - `dietary_fiber` (decimal) - Dietary fiber in grams
      - `total_sugars` (decimal) - Total sugars in grams
      - `protein` (decimal) - Protein in grams
      - `created_at` (timestamptz) - Timestamp when meal was logged
      
  2. Security
    - Enable RLS on `meals` table
    - Add policy for users to read their own meals
    - Add policy for users to insert their own meals
    - Users cannot update or delete meals (read-only history)
    
  3. Indexes
    - Create index on user_id for efficient querying
    - Create index on meal_date for date-based filtering
*/

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_description text NOT NULL,
  meal_date date NOT NULL,
  calories decimal(10,2) NOT NULL DEFAULT 0,
  total_fat decimal(10,2) NOT NULL DEFAULT 0,
  saturated_fat decimal(10,2) NOT NULL DEFAULT 0,
  trans_fat decimal(10,2) NOT NULL DEFAULT 0,
  cholesterol decimal(10,2) NOT NULL DEFAULT 0,
  sodium decimal(10,2) NOT NULL DEFAULT 0,
  total_carbohydrates decimal(10,2) NOT NULL DEFAULT 0,
  dietary_fiber decimal(10,2) NOT NULL DEFAULT 0,
  total_sugars decimal(10,2) NOT NULL DEFAULT 0,
  protein decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own meals
CREATE POLICY "Users can view own meals"
  ON meals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meals
CREATE POLICY "Users can insert own meals"
  ON meals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meals_meal_date_idx ON meals(meal_date);
CREATE INDEX IF NOT EXISTS meals_user_date_idx ON meals(user_id, meal_date);