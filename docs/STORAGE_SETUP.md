# Supabase Storage Setup Guide

## 🚨 Current Issue
The profile image upload is failing with RLS policy violations. This guide will help you set up the storage buckets correctly.

## 📋 Required Storage Buckets

### 1. Create Storage Buckets

Go to your Supabase Dashboard → Storage → New Bucket

#### Bucket: `profile-images`
- **Name**: `profile-images`
- **Public bucket**: ✅ Check this
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Bucket: `property-images`
- **Name**: `property-images`
- **Public bucket**: ✅ Check this
- **File size limit**: 20MB
- **Allowed MIME types**: `image/*`

#### Bucket: `documents`
- **Name**: `documents`
- **Public bucket**: ✅ Check this
- **File size limit**: 50MB
- **Allowed MIME types**: `application/*`, `text/*`

#### Bucket: `attachments`
- **Name**: `attachments`
- **Public bucket**: ✅ Check this
- **File size limit**: 25MB
- **Allowed MIME types**: `*/*`

#### Bucket: `brochures`
- **Name**: `brochures`
- **Public bucket**: ✅ Check this
- **File size limit**: 30MB
- **Allowed MIME types**: `application/pdf`, `image/*`

## 🔐 RLS Policies Setup

After creating the buckets, you need to set up Row Level Security policies.

### For `profile-images` bucket:

```sql
-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to profile images
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### For `property-images` bucket:

```sql
-- Allow authenticated users to upload property images
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to property images
CREATE POLICY "Property images are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Allow authenticated users to update property images
CREATE POLICY "Users can update property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete property images
CREATE POLICY "Users can delete property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);
```

### For `documents` bucket:

```sql
-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to documents
CREATE POLICY "Documents are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to update documents
CREATE POLICY "Users can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete documents
CREATE POLICY "Users can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);
```

### For `attachments` bucket:

```sql
-- Allow authenticated users to upload attachments
CREATE POLICY "Users can upload attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to attachments
CREATE POLICY "Attachments are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

-- Allow authenticated users to update attachments
CREATE POLICY "Users can update attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete attachments
CREATE POLICY "Users can delete attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'attachments' 
  AND auth.role() = 'authenticated'
);
```

### For `brochures` bucket:

```sql
-- Allow authenticated users to upload brochures
CREATE POLICY "Users can upload brochures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to brochures
CREATE POLICY "Brochures are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'brochures');

-- Allow authenticated users to update brochures
CREATE POLICY "Users can update brochures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete brochures
CREATE POLICY "Users can delete brochures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brochures' 
  AND auth.role() = 'authenticated'
);
```

## 🔧 How to Apply These Policies

### Option 1: SQL Editor
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each policy block
3. Run the queries

### Option 2: Storage Policies UI
1. Go to Supabase Dashboard → Storage → Policies
2. Select each bucket
3. Click "New Policy"
4. Use the policy templates above

## 🧪 Testing the Setup

After setting up the buckets and policies:

1. Go to your CRM → Settings → Storage Test
2. Click "Run Tests" to verify all buckets work
3. Try uploading a profile image in Settings → Profile
4. Check console for any remaining errors

## 🚨 Troubleshooting

### Common Issues:

1. **"Unauthorized" error**: RLS policies not set up correctly
2. **"Bucket not found"**: Bucket not created
3. **"File too large"**: Check bucket file size limits
4. **"Invalid file type"**: Check MIME type restrictions

### Quick Fix Commands:

```sql
-- Check if buckets exist
SELECT * FROM storage.buckets;

-- Check existing policies
SELECT * FROM storage.policies;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## ✅ Verification Checklist

- [ ] All 5 buckets created (`profile-images`, `property-images`, `documents`, `attachments`, `brochures`)
- [ ] All buckets marked as "Public"
- [ ] RLS policies applied for each bucket
- [ ] Storage test passes in admin panel
- [ ] Profile image upload works
- [ ] No console errors during upload

## 📞 Support

If you're still having issues after following this guide:

1. Check the browser console for specific error messages
2. Verify your Supabase project settings
3. Ensure you're using the correct Supabase URL and keys
4. Test with the Storage Test page in your CRM admin panel 