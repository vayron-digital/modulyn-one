-- Storage RLS Policies Migration
-- This file sets up Row Level Security policies for all storage buckets

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Profile Images Bucket Policies
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Property Images Bucket Policies
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Property images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Users can update property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Documents Bucket Policies
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Documents are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Users can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Attachments Bucket Policies
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Attachments are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Users can update attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

-- Brochures Bucket Policies
CREATE POLICY "Users can upload brochures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Brochures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'brochures');

CREATE POLICY "Users can update brochures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete brochures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
); 