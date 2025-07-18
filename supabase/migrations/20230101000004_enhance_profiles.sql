-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[],
  ADD COLUMN IF NOT EXISTS certifications TEXT[],
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{
    "linkedin": null,
    "twitter": null,
    "facebook": null,
    "instagram": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS work_schedule JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    "wednesday": {"start": "09:00", "end": "17:00"},
    "thursday": {"start": "09:00", "end": "17:00"},
    "friday": {"start": "09:00", "end": "17:00"}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "theme": "light",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "dashboard": {
      "show_stats": true,
      "show_recent_activity": true,
      "show_calendar": true
    }
  }'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_reports_to_idx ON profiles(reports_to);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_department_idx ON profiles(department); 