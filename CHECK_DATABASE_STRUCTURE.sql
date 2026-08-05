-- Database Structure Check Script
-- GPdI Melati Depok Church Management System
-- Run this script on production server to check database structure

-- Connect to database
-- psql -U gpdi_user -d gpdi_melati

-- 1. Check all tables
SELECT '=== ALL TABLES ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check admin_users table structure
SELECT '=== ADMIN_USERS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- 3. Check jemaat table structure
SELECT '=== JEMAAT TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'jemaat'
ORDER BY ordinal_position;

-- 4. Check schedules table structure
SELECT '=== SCHEDULES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'schedules'
ORDER BY ordinal_position;

-- 5. Check hero_slides table structure
SELECT '=== HERO_SLIDES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'hero_slides'
ORDER BY ordinal_position;

-- 6. Check announcements table structure
SELECT '=== ANNOUNCEMENTS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'announcements'
ORDER BY ordinal_position;

-- 7. Check warta_jemaat table structure
SELECT '=== WARTA_JEMAAT TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'warta_jemaat'
ORDER BY ordinal_position;

-- 8. Check registrations table structure
SELECT '=== REGISTRATIONS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'registrations'
ORDER BY ordinal_position;

-- 9. Check data count in each table
SELECT '=== DATA COUNTS ===' as info;
SELECT 
    'admin_users' as table_name, COUNT(*) as row_count 
FROM admin_users
UNION ALL
SELECT 
    'jemaat' as table_name, COUNT(*) as row_count 
FROM jemaat
UNION ALL
SELECT 
    'schedules' as table_name, COUNT(*) as row_count 
FROM schedules
UNION ALL
SELECT 
    'hero_slides' as table_name, COUNT(*) as row_count 
FROM hero_slides
UNION ALL
SELECT 
    'announcements' as table_name, COUNT(*) as row_count 
FROM announcements
UNION ALL
SELECT 
    'warta_jemaat' as table_name, COUNT(*) as row_count 
FROM warta_jemaat
UNION ALL
SELECT 
    'registrations' as table_name, COUNT(*) as row_count 
FROM registrations;

-- 10. Check for missing columns that should exist
SELECT '=== MISSING COLUMNS CHECK ===' as info;

-- Check if jemaat has wadah, rayon, no_telepon columns
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jemaat' AND column_name = 'wadah'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as wadah_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jemaat' AND column_name = 'rayon'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as rayon_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'jemaat' AND column_name = 'no_hp'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as no_hp_column;

-- Check if schedules has registration-related columns
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'hari_jam'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as hari_jam_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'kategori'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as kategori_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'is_registration_required'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as is_registration_required_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'kuota'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as kuota_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'lokasi'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as lokasi_column;

-- Check if hero_slides has CTA-related columns
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hero_slides' AND column_name = 'cta_type'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as cta_type_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hero_slides' AND column_name = 'cta_text'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as cta_text_column,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hero_slides' AND column_name = 'subtitle'
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as subtitle_column;
