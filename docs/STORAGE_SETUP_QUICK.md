# 🚀 Quick Storage Setup (No SQL Required!)

## 🚨 The Issue
You got `must be owner of table objects` error because you need admin permissions. Let's use the Supabase Dashboard UI instead!

## 📋 Step-by-Step Setup

### **Step 1: Create Storage Buckets**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New Bucket"** for each bucket:

#### Bucket 1: `profile-images`
- **Name**: `profile-images`
- ✅ **Public bucket** (check this!)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Bucket 2: `property-images`
- **Name**: `property-images`
- ✅ **Public bucket** (check this!)
- **File size limit**: 20MB
- **Allowed MIME types**: `image/*`

#### Bucket 3: `documents`
- **Name**: `documents`
- ✅ **Public bucket** (check this!)
- **File size limit**: 50MB
- **Allowed MIME types**: `application/*`, `text/*`

#### Bucket 4: `attachments`
- **Name**: `attachments`
- ✅ **Public bucket** (check this!)
- **File size limit**: 25MB
- **Allowed MIME types**: `*/*`

#### Bucket 5: `brochures`
- **Name**: `brochures`
- ✅ **Public bucket** (check this!)
- **File size limit**: 30MB
- **Allowed MIME types**: `application/pdf`, `image/*`

### **Step 2: Set Up RLS Policies (Using Dashboard UI)**

For each bucket, follow these steps:

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. Select the bucket (e.g., `profile-images`)
3. Click **"New Policy"**
4. Choose **"Create a policy from template"**
5. Select **"Enable read access to everyone"** (for SELECT)
6. Click **"Review"** and **"Save policy"**
7. Repeat for each bucket

### **Step 3: Add Upload Policies**

For each bucket, add these policies:

#### **INSERT Policy (Upload)**
1. Click **"New Policy"** again
2. Choose **"Create a policy from template"**
3. Select **"Enable insert for authenticated users only"**
4. Click **"Review"** and **"Save policy"**

#### **UPDATE Policy**
1. Click **"New Policy"** again
2. Choose **"Create a policy from template"**
3. Select **"Enable update for authenticated users only"**
4. Click **"Review"** and **"Save policy"**

#### **DELETE Policy**
1. Click **"New Policy"** again
2. Choose **"Create a policy from template"**
3. Select **"Enable delete for authenticated users only"**
4. Click **"Review"** and **"Save policy"**

## 🧪 Test Your Setup

1. Go to your CRM → **Settings** → **Storage Test**
2. Click **"Run Tests"**
3. If all tests pass, try uploading a profile image

## ✅ What You Should See

After setup, your profile image upload should work:
- ✅ File selected successfully
- ✅ Upload to Supabase storage successful
- ✅ Database update successful
- ✅ Profile image updated immediately

## 🚨 If Still Having Issues

1. **Check bucket names** - they must be exactly: `profile-images`, `property-images`, `documents`, `attachments`, `brochures`
2. **Verify buckets are public** - the "Public bucket" checkbox must be checked
3. **Check policies** - each bucket should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
4. **Test with Storage Test page** - this will tell you exactly what's wrong

## 🎯 Expected Result

Once you've set up all 5 buckets with their policies, your profile image upload will work perfectly! No more RLS errors! 🚀 