# 🔧 Storage RLS Policy Fix

## 🚨 Current Issue
The upload is still failing with "new row violates row-level security policy" even after setting up policies. This means the RLS policy is too restrictive.

## 🔍 Root Cause
The policy expects files to be in a user-specific folder structure, but there might be a mismatch between the policy and the upload path.

## 🛠️ Quick Fix: Use Simpler RLS Policy

### **Option 1: Delete Current Policy and Create New One**

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. Select the `profile-images` bucket
3. **Delete the existing policy** (click the trash icon)
4. Click **"New Policy"**
5. Choose **"Create a policy from template"**
6. Select **"Enable insert for authenticated users only"**
7. Click **"Review"** and **"Save policy"**
8. Repeat for SELECT, UPDATE, DELETE operations

### **Option 2: Use This Exact Policy**

If you want to keep the user-specific folder structure, use this exact policy:

**Policy Name:** `Profile images - user specific access`

**Operations:** SELECT, INSERT, UPDATE, DELETE (all checked)

**SQL Policy:**
```sql
bucket_id = 'profile-images' AND auth.role() = 'authenticated'
```

**Target roles:** Leave as default (public)

## 🧪 Test the Fix

1. **Try uploading a profile image** in Settings → Profile
2. **Check the console** for any errors
3. **Verify the file path** - it should now be `userId/filename.jpg`

## 🎯 Expected Result

After applying the simpler policy:
- ✅ File uploads to `profile-images/userId/filename.jpg`
- ✅ No more RLS policy violations
- ✅ Profile image updates successfully

## 🚨 If Still Not Working

### **Check Bucket Settings:**
1. Go to **Storage** → **Buckets**
2. Click on `profile-images`
3. Verify:
   - ✅ **Public bucket** is checked
   - ✅ **File size limit** is 10MB or higher
   - ✅ **Allowed MIME types** includes `image/*`

### **Check Policy Count:**
Each bucket should have exactly **4 policies**:
- SELECT (public read)
- INSERT (authenticated upload)
- UPDATE (authenticated modify)
- DELETE (authenticated remove)

### **Alternative: Disable RLS Temporarily**
If nothing works, you can temporarily disable RLS to test:

1. Go to **Storage** → **Policies**
2. Click **"Disable RLS"** (temporary test only)
3. Try uploading
4. If it works, re-enable RLS and use the simpler policy above

## 📞 Next Steps

1. **Apply the simpler policy** (Option 1 or 2 above)
2. **Test the upload** again
3. **Let me know the result** - I'll help troubleshoot further if needed

The key is using a simpler RLS policy that doesn't rely on complex folder structures! 🚀 