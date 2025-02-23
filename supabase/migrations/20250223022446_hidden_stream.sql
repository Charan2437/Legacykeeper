/*
  # Create nominees table

  1. New Tables
    - `nominees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `relationship` (text)
      - `photo_url` (text)
      - `government_id_url` (text)
      - `categories` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `nominees` table
    - Add policies for authenticated users to:
      - Read their own nominees
      - Create new nominees
      - Update their own nominees
      - Delete their own nominees
*/

CREATE TABLE IF NOT EXISTS nominees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  photo_url text,
  government_id_url text,
  categories text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;

-- Policy for reading nominees
CREATE POLICY "Users can read their own nominees"
  ON nominees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for creating nominees
CREATE POLICY "Users can create nominees"
  ON nominees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating nominees
CREATE POLICY "Users can update their own nominees"
  ON nominees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting nominees
CREATE POLICY "Users can delete their own nominees"
  ON nominees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_nominees_updated_at
  BEFORE UPDATE ON nominees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();