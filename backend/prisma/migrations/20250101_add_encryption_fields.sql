-- Migration: Add encryption fields for sensitive data
-- Date: 2025-01-01
-- Description: Add encrypted versions of sensitive fields to existing tables

-- Add encrypted fields to User table
ALTER TABLE users ADD COLUMN email_encrypted TEXT;
ALTER TABLE users ADD COLUMN name_encrypted TEXT;

-- Add encrypted fields to ProductionPlanItem table
ALTER TABLE production_plan_items ADD COLUMN siparis_veren_encrypted TEXT;
ALTER TABLE production_plan_items ADD COLUMN musteri_no_encrypted TEXT;
ALTER TABLE production_plan_items ADD COLUMN musteri_kalemi_encrypted TEXT;
ALTER TABLE production_plan_items ADD COLUMN siparis_encrypted TEXT;
ALTER TABLE production_plan_items ADD COLUMN malzeme_no_encrypted TEXT;
ALTER TABLE production_plan_items ADD COLUMN malzeme_kisa_metni_encrypted TEXT;

-- Add encrypted fields to MaterialProfileMapping table
ALTER TABLE material_profile_mappings ADD COLUMN malzeme_no_encrypted TEXT;
ALTER TABLE material_profile_mappings ADD COLUMN malzeme_kisa_metni_encrypted TEXT;

-- Add indexes for encrypted fields (for search purposes)
CREATE INDEX idx_users_email_encrypted ON users(email_encrypted);
CREATE INDEX idx_production_plan_items_siparis_encrypted ON production_plan_items(siparis_encrypted);
CREATE INDEX idx_production_plan_items_malzeme_no_encrypted ON production_plan_items(malzeme_no_encrypted);
CREATE INDEX idx_material_profile_mappings_malzeme_no_encrypted ON material_profile_mappings(malzeme_no_encrypted);

-- Add comments for documentation
COMMENT ON COLUMN users.email_encrypted IS 'Encrypted version of email field for security';
COMMENT ON COLUMN users.name_encrypted IS 'Encrypted version of name field for security';
COMMENT ON COLUMN production_plan_items.siparis_veren_encrypted IS 'Encrypted version of siparis_veren field for security';
COMMENT ON COLUMN production_plan_items.musteri_no_encrypted IS 'Encrypted version of musteri_no field for security';
COMMENT ON COLUMN production_plan_items.musteri_kalemi_encrypted IS 'Encrypted version of musteri_kalemi field for security';
COMMENT ON COLUMN production_plan_items.siparis_encrypted IS 'Encrypted version of siparis field for security';
COMMENT ON COLUMN production_plan_items.malzeme_no_encrypted IS 'Encrypted version of malzeme_no field for security';
COMMENT ON COLUMN production_plan_items.malzeme_kisa_metni_encrypted IS 'Encrypted version of malzeme_kisa_metni field for security';
COMMENT ON COLUMN material_profile_mappings.malzeme_no_encrypted IS 'Encrypted version of malzeme_no field for security';
COMMENT ON COLUMN material_profile_mappings.malzeme_kisa_metni_encrypted IS 'Encrypted version of malzeme_kisa_metni field for security';
