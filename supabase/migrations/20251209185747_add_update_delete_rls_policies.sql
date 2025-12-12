/*
  # Add UPDATE and DELETE RLS Policies for Meals Table

  ## Changes
  This migration adds Row Level Security policies to allow users to update and delete their own meals.
  
  1. Security Policies Added
    - **UPDATE Policy**: "Users can update their own meals"
      - Allows authenticated users to update meals where they are the owner (auth.uid() = user_id)
      - Applies both USING and WITH CHECK clauses to ensure ownership before and after update
    
    - **DELETE Policy**: "Users can delete their own meals"
      - Allows authenticated users to delete meals where they are the owner (auth.uid() = user_id)
      - Applies USING clause to verify ownership before deletion
  
  ## Important Notes
  - These policies are restrictive: users can ONLY modify their own meals
  - The policies use auth.uid() to verify the authenticated user's identity
  - Both policies require the user to be authenticated (TO authenticated)
  - UPDATE policy checks ownership both before (USING) and after (WITH CHECK) the operation
  - DELETE policy checks ownership before the operation (USING)
*/

-- Policy: Users can update their own meals
CREATE POLICY "Users can update their own meals"
  ON meals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own meals
CREATE POLICY "Users can delete their own meals"
  ON meals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);