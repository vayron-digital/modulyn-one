-- Migration: 032_add_extended_user_fields.sql
-- Purpose: Add extended employment, personal, emergency, and payroll fields to profiles. Expand user_role enum. Add designation FK.
-- Depends on: 001_initial_schema.sql
-- Date: 2024-06-09

-- 1. Expand user_role enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'team_leader', 'jr_team_leader', 'director', 'head_of_sales', 'other');
  ELSE
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'team_leader';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'jr_team_leader';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'director';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'head_of_sales';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'other';
  END IF;
END $$;

-- 2. Add designation_id FK (to be created in designations table)
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS designation_id UUID;

-- 3. Add employment info
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS date_of_joining DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role user_role;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS reporting_person UUID;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS availability VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS prev_employer VARCHAR(255);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS allow_exclusion BOOLEAN DEFAULT false;

-- 4. Add personal info
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS blood_group VARCHAR(8);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS nationality VARCHAR(64);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS marital_status VARCHAR(16);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address_uae TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS home_country_contact VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255);

-- 5. Add emergency contact
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS emergency_name VARCHAR(128);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS emergency_number VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS emergency_relation VARCHAR(64);

-- 6. Add identification
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS passport_number VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS passport_expiry DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS visa_number VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS visa_expiry DATE;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS visa_type VARCHAR(32);

-- 7. Add education
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS education VARCHAR(32);

-- 8. Add payroll details
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS bank_name VARCHAR(64);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS ifsc VARCHAR(32);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS iban VARCHAR(64);
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS bank_account VARCHAR(64);

-- 9. Add password (hashed, nullable for now)
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 10. Add profile picture upload (already exists as profile_photo_url)
-- No action needed if already present.

-- 11. Add constraints/FKs (to be created in designations table)
-- ALTER TABLE IF EXISTS profiles ADD CONSTRAINT fk_designation FOREIGN KEY (designation_id) REFERENCES designations(id);
-- ALTER TABLE IF EXISTS profiles ADD CONSTRAINT fk_reporting_person FOREIGN KEY (reporting_person) REFERENCES profiles(id); 