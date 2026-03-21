-- Add onboarding and Gemini key fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
