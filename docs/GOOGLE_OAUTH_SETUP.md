# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for the Modulyn CRM application.

## Frontend Implementation ✅

The frontend OAuth integration is already implemented and includes:

### 1. AuthContext Enhancements
- `signInWithGoogle()` method for initiating OAuth flow
- `handleOAuthUser()` method for processing OAuth user data
- OAuth user profile creation and validation

### 2. Login Component
- Functional Google OAuth button
- Loading states and error handling
- Automatic redirect to account creation flow

### 3. Account Creation Flow
- OAuth user detection and pre-filling
- Password field hiding for OAuth users
- Streamlined account setup process
- Tenant creation and profile completion

### 4. OAuth Callback Handler
- `/auth/callback` route for handling OAuth redirects
- Automatic routing based on user profile completion status
- Error handling and user feedback

### 5. Database Schema
- OAuth fields added to profiles table:
  - `oauth_provider` (e.g., 'google')
  - `oauth_id` (Google user ID)
  - `profile_image_url` (Google profile image)
- Index for efficient OAuth lookups

## Backend Setup Required

### 1. Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

### 2. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
   - Authorized JavaScript origins: Your app domain

### 3. Environment Variables
Add to your Supabase environment:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## User Flow

### New OAuth User
1. User clicks "Continue with Google" on login/signup
2. Google OAuth flow completes
3. User redirected to `/auth/callback`
4. System creates basic profile with OAuth data
5. User redirected to `/account-creation` for essential details
6. User completes company info and payment
7. Account fully activated

### Existing OAuth User
1. User clicks "Continue with Google"
2. Google OAuth flow completes
3. System checks for complete profile
4. If complete: Redirect to dashboard
5. If incomplete: Redirect to account creation

## Security Features

- OAuth users still require essential account setup
- Profile completion validation
- Tenant creation required for CRM access
- Secure session management
- Error handling and user feedback

## Testing

1. Test OAuth flow with test Google account
2. Verify profile creation and pre-filling
3. Test account completion flow
4. Verify dashboard access after completion
5. Test error scenarios (cancelled OAuth, network issues)

## Notes

- OAuth users skip password creation but still need essential account details
- Company information and payment are still required
- Profile images from Google are automatically imported
- OAuth provider and ID are stored for future reference
