-- Migration Script: Add Missing Columns
-- GPdI Melati Depok Church Management System
-- Run this on production database

-- 1. Add missing columns to announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS ringkasan TEXT,
ADD COLUMN IF NOT EXISTS isi TEXT,
ADD COLUMN IF NOT EXISTS penting BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gambar_url TEXT;

-- Update existing data: move konten to isi if konten exists
UPDATE announcements 
SET isi = konten 
WHERE konten IS NOT NULL AND isi IS NULL;

-- 2. Add missing columns to warta_jemaat table
ALTER TABLE warta_jemaat 
ADD COLUMN IF NOT EXISTS edisi VARCHAR(255),
ADD COLUMN IF NOT EXISTS tema_minggu VARCHAR(255),
ADD COLUMN IF NOT EXISTS ayat_minggu VARCHAR(255),
ADD COLUMN IF NOT EXISTS pengumuman TEXT;

-- Update existing data: move judul to edisi if judul exists
UPDATE warta_jemaat 
SET edisi = judul 
WHERE judul IS NOT NULL AND edisi IS NULL;

-- 3. Add missing columns to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS rayon VARCHAR(100),
ADD COLUMN IF NOT EXISTS jenis_kegiatan VARCHAR(255),
ADD COLUMN IF NOT EXISTS tanggal_daftar TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Add missing columns to schedules table (if any)
-- Check if deskripsi exists, if not add it
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- Verify the changes
SELECT 'Migration completed successfully' as status;
