/*
  # Create storage buckets for nominee photos and documents

  1. New Storage Buckets
    - `profile-photos` - For storing nominee profile photos
    - `government-ids` - For storing nominee government ID documents
  
  2. Security
    - Enable public access for profile photos
    - Restrict access to government IDs to authenticated users only
*/

-- Create bucket for profile photos with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'Profile Photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for government IDs with restricted access
INSERT INTO storage.buckets (id, name, public)
VALUES ('government-ids', 'Government IDs', false)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for profile-photos bucket
CREATE POLICY "Public Access to Profile Photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their profile photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-photos');

-- Set up security policies for government-ids bucket
CREATE POLICY "Only authenticated users can view government IDs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'government-ids');

CREATE POLICY "Users can upload government IDs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'government-ids');

CREATE POLICY "Users can update their government IDs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'government-ids');