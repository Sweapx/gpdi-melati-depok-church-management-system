# Deployment Guide & Migration Checklist
## GPdI Melati Depok Church Management System
**Update Date**: August 3, 2026

---

## 📋 Pre-Deployment Checklist

### ✅ Code Verification
- [ ] All local changes have been committed to git
- [ ] Application runs successfully in development mode
- [ ] No TypeScript errors in the codebase
- [ ] All routes are working correctly (public & admin)
- [ ] API endpoints are responding correctly
- [ ] Database seed data is properly structured

### ✅ Database Preparation
- [ ] Backup current production database
- [ ] Review schema changes needed
- [ ] Prepare migration SQL scripts
- [ ] Test migration on staging database (if available)

### ✅ Environment Variables
- [ ] Verify `.env` file contains all required variables
- [ ] Check database connection string
- [ ] Verify JWT_SECRET is set
- [ ] Check GEMINI_API_KEY (optional, for chatbot)

---

## 🗄️ Database Migration Steps

### Schema Changes Required

#### 1. Add New Columns to `jemaat` Table
```sql
ALTER TABLE jemaat 
ADD COLUMN IF NOT EXISTS wadah VARCHAR(100),
ADD COLUMN IF NOT EXISTS rayon VARCHAR(100),
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(20);
```

#### 2. Update `schedules` Table Structure
```sql
-- Add new columns for enhanced schedule management
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS hari_jam VARCHAR(100),
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kuota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS terdaftar INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(50),
ADD COLUMN IF NOT EXISTS need_payment_proof BOOLEAN DEFAULT false;

-- Note: The application now uses 'hariJam' (combined day & time) instead of separate 'tanggal' and 'waktu'
-- Existing data may need migration
```

#### 3. Update `hero_slides` Table
```sql
ALTER TABLE hero_slides
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS badge VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS event_name VARCHAR(255);
```

#### 4. Update `announcements` Table
```sql
-- Remove unused columns if they exist
ALTER TABLE announcements DROP COLUMN IF EXISTS kategori;
ALTER TABLE announcements DROP COLUMN IF EXISTS tanggal;
-- Note: The application no longer uses these fields in the CMS forms
```

### Migration Execution Steps

1. **SSH into Digital Ocean VPS**
   ```bash
   ssh root@your-server-ip
   ```

2. **Backup Current Database**
   ```bash
   pg_dump gpdi_melati > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Apply Schema Changes**
   ```bash
   psql -U gpdi_user -d gpdi_melati < migration_script.sql
   ```

4. **Verify Migration**
   ```bash
   psql -U gpdi_user -d gpdi_melati -c "\d jemaat"
   psql -U gpdi_user -d gpdi_melati -c "\d schedules"
   psql -U gpdi_user -d gpdi_melati -c "\d hero_slides"
   ```

---

## 🚀 Deployment Steps

### Option A: Git Pull (Recommended)

1. **SSH into server**
   ```bash
   ssh root@your-server-ip
   cd /path/to/gpdi-melati-depok-church-management-system
   ```

2. **Pull latest changes**
   ```bash
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build application**
   ```bash
   npm run build
   ```

5. **Restart application**
   ```bash
   pm2 restart gpdi-melati
   # or if using systemd:
   systemctl restart gpdi-melati
   ```

### Option B: Manual Upload

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload files to server**
   ```bash
   scp -r dist/* root@your-server-ip:/path/to/app/
   scp -r node_modules root@your-server-ip:/path/to/app/
   scp package.json root@your-server-ip:/path/to/app/
   ```

3. **Restart application on server**

---

## ✅ Post-Deployment Verification

### 1. Public Pages Testing
- [ ] Home page loads correctly (`/`)
- [ ] Hero slides display properly
- [ ] Schedule section shows 12 items
- [ ] Announcement section displays
- [ ] Jadwal & Event page loads (`/jadwal-event`)
  - [ ] Tab "Jadwal Ibadah" shows ibadah schedules
  - [ ] Tab "Event & Kegiatan" shows events
- [ ] Pendaftaran page loads (`/pendaftaran`)
  - [ ] Form has 2 steps (no file upload)
  - [ ] Submission works correctly
- [ ] Layanan page loads (`/layanan`)
- [ ] Warta Jemaat page loads (`/warta`)
- [ ] Navigation menu works correctly
- [ ] Chatbot widget appears

### 2. Admin Pages Testing
- [ ] Login page loads (`/admin/login`)
  - [ ] Login with admin/admin123 works
- [ ] Dashboard loads correctly
  - [ ] Stats display properly
- [ ] Jemaat page loads (`/admin/jemaat`)
  - [ ] CRUD operations work
- [ ] Approvals page loads (`/admin/approvals`)
  - [ ] Approval/rejection works
- [ ] CMS page loads (`/admin/cms`)
  - [ ] Hero Slides tab works (no kategori/waktu fields)
  - [ ] Warta Jemaat tab works (no kategori field)
  - [ ] Pengumuman tab works (no kategori/waktu/status fields)
  - [ ] Schedules tab works
- [ ] Knowledge Base page loads (`/admin/kb`)
- [ ] Prayers page loads (`/admin/prayers`)
- [ ] Sidebar has scroll functionality
- [ ] Sidebar "G" letter is removed

### 3. API Endpoints Testing
```bash
# Test schedules endpoint
curl https://gpdimelati.me/api/schedules

# Test registrations endpoint
curl https://gpdimelati.me/api/registrations

# Test hero slides endpoint
curl https://gpdimelati.me/api/hero-slides

# Test announcements endpoint
curl https://gpdimelati.me/api/announcements
```

### 4. Database Verification
```bash
# Check if new columns exist
psql -U gpdi_user -d gpdi_melati -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'jemaat' AND column_name IN ('wadah', 'rayon', 'no_telepon');"

# Check schedules data
psql -U gpdi_user -d gpdi_melati -c "SELECT COUNT(*) FROM schedules;"

# Check hero slides data
psql -U gpdi_user -d gpdi_melati -c "SELECT COUNT(*) FROM hero_slides WHERE is_active = true;"
```

---

## 🔄 Rollback Plan

### If Issues Occur

1. **Rollback Database**
   ```bash
   psql -U gpdi_user -d gpdi_melati < backup_YYYYMMDD_HHMMSS.sql
   ```

2. **Rollback Code**
   ```bash
   git checkout previous-commit-hash
   npm install
   npm run build
   pm2 restart gpdi-melati
   ```

3. **Verify Rollback**
   - Check if application works with previous version
   - Verify database integrity

---

## 📊 Summary of Changes

### Frontend Changes
1. **Public Registration Form**
   - Removed file upload (KTP upload)
   - Reduced from 3 steps to 2 steps
   - Removed FileUpload component

2. **CMS Forms**
   - Hero Slides: Removed kategori, waktu fields (kept status)
   - Warta Jemaat: Removed kategori field
   - Pengumuman: Removed kategori, waktu, status fields
   - Updated table headers to reflect changes

3. **Admin Sidebar**
   - Added scroll functionality
   - Removed "G" letter logo

4. **Schedule Data**
   - Added 12 seed schedules with deskripsi field
   - Updated ScheduleItem type (kategori now string instead of enum)

### Backend Changes
1. **Database Seed Data**
   - Added 12 schedules with proper structure
   - Updated admin seed with bcrypt password hashing

2. **Type Definitions**
   - ScheduleItem.kategori changed from enum to string
   - Made lokasi and pembicara optional

### Database Schema Changes
1. **jemaat table**: Added wadah, rayon, no_telepon columns
2. **schedules table**: Added hari_jam, kategori, and registration-related columns
3. **hero_slides table**: Added subtitle, badge, cta_text, cta_type columns
4. **announcements table**: Removed unused kategori, tanggal columns

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Application won't start after deployment**
- Solution: Check logs with `pm2 logs gpdi-melati` or `journalctl -u gpdi-melati`
- Verify node_modules are installed correctly
- Check environment variables

**Issue: Database connection error**
- Solution: Verify DATABASE_URL in .env
- Check PostgreSQL service is running: `systemctl status postgresql`
- Test connection: `psql -U gpdi_user -d gpdi_melati`

**Issue: Schedules not displaying**
- Solution: Verify seed data was applied
- Check API endpoint: `/api/schedules`
- Verify database has schedules data

**Issue: Admin login fails**
- Solution: Verify admin user exists in database
- Check password hash is correct (bcrypt)
- Verify JWT_SECRET is set

---

## 📞 Contact Information

For deployment issues, contact:
- **Technical Support**: [Your Contact]
- **Database Admin**: [Your Contact]
- **Project Lead**: [Your Contact]

---

## 📝 Deployment Log

**Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Database Backup**: _______________
**Migration Applied**: [ ] Yes [ ] No
**Post-Deployment Test**: [ ] Passed [ ] Failed
**Notes**: _______________
