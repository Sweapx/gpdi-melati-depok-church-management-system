# Deployment Commands - Copy & Paste to Server
## GPdI Melati Depok Church Management System

**Langkah 1: SSH ke server**
```bash
ssh root@your-server-ip
```

**Langkah 2: Backup database**
```bash
pg_dump gpdi_melati > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Langkah 3: Navigate ke app directory**
```bash
cd /var/www/gpdi-melati-depok-church-management-system
```

**Langkah 4: Pull latest code dari GitHub**
```bash
git pull origin main
```

**Langkah 5: Install dependencies**
```bash
npm install
```

**Langkah 6: Apply database migrations**
```bash
psql -U gpdi_user -d gpdi_melati <<EOF
ALTER TABLE jemaat 
ADD COLUMN IF NOT EXISTS wadah VARCHAR(100),
ADD COLUMN IF NOT EXISTS rayon VARCHAR(100),
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(20);
EOF
```

```bash
psql -U gpdi_user -d gpdi_melati <<EOF
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS hari_jam VARCHAR(100),
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kuota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS terdaftar INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(50),
ADD COLUMN IF NOT EXISTS need_payment_proof BOOLEAN DEFAULT false;
EOF
```

```bash
psql -U gpdi_user -d gpdi_melati <<EOF
ALTER TABLE hero_slides
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS badge VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS event_name VARCHAR(255);
EOF
```

**Langkah 7: Build application**
```bash
npm run build
```

**Langkah 8: Restart application (pilih salah satu)**

Jika menggunakan PM2:
```bash
pm2 restart gpdi-melati
```

Jika menggunakan systemd:
```bash
systemctl restart gpdi-melati
```

**Langkah 9: Verifikasi deployment**
```bash
pm2 status
pm2 logs gpdi-melati
```

---

## One-Liner Version (Copy semua sekaligus)

```bash
# SSH ke server dulu, lalu copy-paste semua perintah ini:
cd /var/www/gpdi-melati-depok-church-management-system && \
pg_dump gpdi_melati > backup_$(date +%Y%m%d_%H%M%S).sql && \
git pull origin main && \
npm install && \
psql -U gpdi_user -d gpdi_melati -c "ALTER TABLE jemaat ADD COLUMN IF NOT EXISTS wadah VARCHAR(100), ADD COLUMN IF NOT EXISTS rayon VARCHAR(100), ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(20);" && \
psql -U gpdi_user -d gpdi_melati -c "ALTER TABLE schedules ADD COLUMN IF NOT EXISTS hari_jam VARCHAR(100), ADD COLUMN IF NOT EXISTS kategori VARCHAR(100), ADD COLUMN IF NOT EXISTS is_registration_required BOOLEAN DEFAULT false, ADD COLUMN IF NOT EXISTS kuota INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS terdaftar INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(50), ADD COLUMN IF NOT EXISTS need_payment_proof BOOLEAN DEFAULT false;" && \
psql -U gpdi_user -d gpdi_melati -c "ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS subtitle TEXT, ADD COLUMN IF NOT EXISTS badge VARCHAR(100), ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100), ADD COLUMN IF NOT EXISTS cta_type VARCHAR(50), ADD COLUMN IF NOT EXISTS event_name VARCHAR(255);" && \
npm run build && \
pm2 restart gpdi-melati && \
pm2 status
```

---

## Catatan Penting

1. **Ganti `your-server-ip`** dengan IP address server Digital Ocean Anda
2. **Ganti `/var/www/gpdi-melati-depok-church-management-system`** dengan path aplikasi yang benar di server
3. **Ganti `gpdi_user`** dengan nama user database yang benar
4. Pastikan user database memiliki permission untuk ALTER TABLE
5. Pastikan PostgreSQL service sedang berjalan

---

## Rollback Commands (Jika ada masalah)

```bash
# Restore database dari backup
psql -U gpdi_user -d gpdi_melati < backup_YYYYMMDD_HHMMSS.sql

# Rollback code ke commit sebelumnya
git checkout previous-commit-hash
npm install
npm run build
pm2 restart gpdi-melati
```
