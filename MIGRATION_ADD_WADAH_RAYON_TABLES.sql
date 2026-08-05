-- Migration script to add wadah and rayon tables

-- Create wadah table
CREATE TABLE IF NOT EXISTS wadah (
  id VARCHAR(50) PRIMARY KEY,
  nama_wadah VARCHAR(255) NOT NULL,
  ketua_wadah VARCHAR(255) NOT NULL,
  umur_minimal INTEGER NOT NULL DEFAULT 0,
  umur_maksimal INTEGER NOT NULL DEFAULT 0,
  jumlah_anggota INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rayon table
CREATE TABLE IF NOT EXISTS rayon (
  id VARCHAR(50) PRIMARY KEY,
  nama_rayon VARCHAR(255) NOT NULL UNIQUE,
  ketua_rayon VARCHAR(255) NOT NULL,
  jumlah_anggota INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add wadah column to jemaat table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jemaat' AND column_name = 'wadah'
  ) THEN
    ALTER TABLE jemaat ADD COLUMN wadah VARCHAR(255);
  END IF;
END $$;

-- Add rayon column to jemaat table if not exists (should already exist, but check anyway)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jemaat' AND column_name = 'rayon'
  ) THEN
    ALTER TABLE jemaat ADD COLUMN rayon VARCHAR(255);
  END IF;
END $$;

-- Insert sample data for wadah
INSERT INTO wadah (id, nama_wadah, ketua_wadah, umur_minimal, umur_maksimal, jumlah_anggota)
VALUES 
  ('WAD-001', 'Wadah Muda Mudi', 'Budi Santoso', 18, 35, 0),
  ('WAD-002', 'Wadah Remaja', 'Siti Rahayu', 13, 17, 0),
  ('WAD-003', 'Wadah Dewasa', 'Agus Pratama', 36, 60, 0),
  ('WAD-004', 'Wadah Lansia', 'Dewi Sartika', 61, 100, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for rayon
INSERT INTO rayon (id, nama_rayon, ketua_rayon, jumlah_anggota)
VALUES 
  ('RAY-001', 'Rayon Depok Timur', 'Hendro Wijaya', 0),
  ('RAY-002', 'Rayon Depok Barat', 'Dewi Sartika', 0),
  ('RAY-003', 'Rayon Depok Selatan', 'Rudi Hartono', 0),
  ('RAY-004', 'Rayon Depok Utara', 'Sri Mulyani', 0)
ON CONFLICT (id) DO NOTHING;
