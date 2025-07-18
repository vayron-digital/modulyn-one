-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN alternate_contact TEXT,
ADD COLUMN dob DATE,
ADD COLUMN date_of_joining DATE,
ADD COLUMN blood_group TEXT,
ADD COLUMN nationality TEXT,
ADD COLUMN marital_status TEXT,
ADD COLUMN is_bachelor BOOLEAN DEFAULT false,
ADD COLUMN medical_conditions TEXT,
ADD COLUMN emergency_contact_name TEXT,
ADD COLUMN emergency_contact_number TEXT,
ADD COLUMN emergency_contact_relationship TEXT,
ADD COLUMN address TEXT,
ADD COLUMN current_address_uae TEXT,
ADD COLUMN personal_email TEXT,
ADD COLUMN home_country_contact TEXT,
ADD COLUMN designation TEXT,
ADD COLUMN reporting_person TEXT,
ADD COLUMN company TEXT,
ADD COLUMN availability TEXT DEFAULT 'available',
ADD COLUMN passport_number TEXT,
ADD COLUMN passport_expiry DATE,
ADD COLUMN visa_expiry DATE,
ADD COLUMN visa_number TEXT,
ADD COLUMN visa_type TEXT,
ADD COLUMN education_details TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN bank_ifsc TEXT,
ADD COLUMN bank_account_number TEXT;

-- Update RLS policies to allow access to new columns
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Add policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    ); 