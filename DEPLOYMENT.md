# Deployment Guide - GPdI Melati Depok Church Management System
## Digital Ocean VPS Deployment

### Server Information
- **VPS IP**: 159.223.48.154
- **Domain**: gpdimelati.me
- **Application URL**: https://gpdimelati.me

### Prerequisites
- Digital Ocean VPS (Ubuntu 22.04+ recommended)
- Domain name: gpdimelati.me
- GitHub repository dengan code aplikasi

---

## STEP 0: Setup DNS Configuration

**SEBELUM memulai setup VPS**, pastikan DNS domain sudah di-configure:

### 0.1 Login ke Domain Registrar
Login ke tempat Anda membeli domain (GoDaddy, Namecheap, dll)

### 0.2 Add DNS Records
Tambahkan records berikut:

**A Record:**
- **Name/Host**: `@` (atau kosong)
- **Type**: `A`
- **Value**: `159.223.48.154`
- **TTL**: `3600` (atau default)

**A Record (www):**
- **Name/Host**: `www`
- **Type**: `A`
- **Value**: `159.223.48.154`
- **TTL**: `3600` (atau default)

### 0.3 Verifikasi DNS Propagation
Setelah menambahkan DNS records, tunggu beberapa menit lalu verifikasi:

```bash
# Di komputer lokal Anda
ping gpdimelati.me
nslookup gpdimelati.me
```

Pastikan domain sudah mengarah ke IP `159.223.48.154`.

---

## STEP 1: Setup VPS Digital Ocean

### 1.1 Connect ke VPS
```bash
ssh root@159.223.48.154
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js (v20+)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

### 1.4 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### 1.5 Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 1.6 Install PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 1.7 Install Git
```bash
apt install -y git
```

---

## STEP 2: Setup PostgreSQL Database

### 2.1 Create Database dan User
```bash
sudo -u postgres psql
```

Inside PostgreSQL console:
```sql
-- Create database
CREATE DATABASE gpdi_melati;

-- Create user
CREATE USER gpdi_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gpdi_melati TO gpdi_user;

-- Exit
\q
```

### 2.2 Create Tables
```bash
sudo -u postgres psql -d gpdi_melati
```

Inside PostgreSQL console, run these commands:

```sql
-- Admin Users Table
CREATE TABLE admin_users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jemaat Table
CREATE TABLE jemaat (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nik VARCHAR(20) UNIQUE,
    gender VARCHAR(10),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    no_hp VARCHAR(20),
    status_pernikahan VARCHAR(50),
    status_jemaat VARCHAR(50) DEFAULT 'Aktif',
    kategori_kaum VARCHAR(50),
    sektor VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anggota_keluarga JSONB
);

-- Registrations Table
CREATE TABLE registrations (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50),
    nama_pendaftar VARCHAR(255),
    nik VARCHAR(20),
    gender VARCHAR(10),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    no_hp VARCHAR(20),
    lampiran_ktp TEXT,
    lampiran_bukti_bayar TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    status_note TEXT,
    anggota_keluarga JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules Table
CREATE TABLE schedules (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME,
    lokasi VARCHAR(255),
    deskripsi TEXT,
    is_registration_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero Slides Table
CREATE TABLE hero_slides (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    konten TEXT,
    tanggal DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warta Jemaat Table
CREATE TABLE warta_jemaat (
    id VARCHAR(50) PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE,
    pdf_url TEXT,
    petugas_list JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Table
CREATE TABLE knowledge_base (
    id VARCHAR(50) PRIMARY KEY,
    patterns TEXT[] NOT NULL,
    bot_response TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Requests Table
CREATE TABLE prayer_requests (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(255),
    no_hp VARCHAR(20),
    permohonan TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table
CREATE TABLE certificates (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    jemaat_id VARCHAR(50),
    jenis_dokumen VARCHAR(100),
    tanggal_terbit DATE,
    pendeta VARCHAR(255),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exit
\q
```

### 2.3 Seed Default Admin User
```bash
sudo -u postgres psql -d gpdi_melati
```

```sql
-- Insert default admin (password: admin123)
-- Note: This hash is for "admin123" with bcrypt
INSERT INTO admin_users (id, username, password_hash, name, role, must_change_password)
VALUES ('admin-1', 'admin', '$2b$10$rOzJvZvZvZvZvZvZvZvZvZuZvZvZvZvZvZvZvZvZvZvZvZvZvZ', 'Super Admin', 'super_admin', true);

-- Exit
\q
```

---

## STEP 3: Clone dan Setup Application

### 3.1 Clone Repository
```bash
cd /var/www
git clone https://github.com/your-username/gpdi-melati-depok-church-management-system.git
cd gpdi-melati-depok-church-management-system
```

**Note**: Ganti `your-username` dengan username GitHub Anda setelah membuat repository.

### 3.2 Install Dependencies
```bash
npm install --production
```

### 3.3 Build Application
```bash
npm run build
```

### 3.4 Create Uploads Directory
```bash
mkdir -p uploads
chmod 755 uploads
```

### 3.5 Setup Environment Variables
```bash
nano .env
```

Paste the following configuration:
```env
# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_secure_random_jwt_secret_here_min_32_chars

# Database PostgreSQL
DATABASE_URL=postgresql://gpdi_user:your_secure_password_here@localhost:5432/gpdi_melati

# Application URL
APP_URL=https://gpdimelati.me

# Environment
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

---

## STEP 4: Setup PM2

### 4.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Paste the following:
```javascript
module.exports = {
  apps: [{
    name: 'gpdi-melati-app',
    script: 'dist/server.cjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 4.2 Create Logs Directory
```bash
mkdir -p logs
```

### 4.3 Start Application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command that PM2 outputs (usually something like `sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user`)

---

## STEP 5: Setup Nginx Reverse Proxy

### 5.1 Create Nginx Configuration
```bash
nano /etc/nginx/sites-available/gpdi-melati
```

Paste the following:
```nginx
server {
    listen 80;
    server_name gpdimelati.me www.gpdimelati.me;

    # Increase upload size
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/gpdi-melati-depok-church-management-system/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Enable Configuration
```bash
ln -s /etc/nginx/sites-available/gpdi-melati /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## STEP 6: Setup SSL Certificate (Let's Encrypt)

### 6.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtain SSL Certificate
```bash
certbot --nginx -d gpdimelati.me -d www.gpdimelati.me
```

Follow the prompts to configure SSL.

### 6.3 Auto-renew SSL
```bash
certbot renew --dry-run
```

Renewal is automatically configured by certbot.

---

## STEP 7: Setup Firewall

### 7.1 Configure UFW
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## STEP 8: Monitoring dan Maintenance

### 8.1 Check PM2 Status
```bash
pm2 status
pm2 logs gpdi-melati-app
```

### 8.2 Restart Application
```bash
pm2 restart gpdi-melati-app
```

### 8.3 Update Application
```bash
cd /var/www/gpdi-melati-depok-church-management-system
git pull origin main
npm install --production
npm run build
pm2 restart gpdi-melati-app
```

---

## Troubleshooting

### Application tidak start
```bash
pm2 logs gpdi-melati-app
# Check logs for errors
```

### Database connection error
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
sudo -u postgres psql -d gpdi_melati
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

### Permission issues with uploads
```bash
chown -R www-data:www-data /var/www/gpdi-melati-depok-church-management-system/uploads
chmod -R 755 /var/www/gpdi-melati-depok-church-management-system/uploads
```

---

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Use strong JWT_SECRET** (minimum 32 characters)
3. **Keep system updated** with `apt update && apt upgrade`
4. **Configure firewall** to only allow necessary ports
5. **Use SSH key authentication** instead of password
6. **Regular database backups** using pg_dump
7. **Monitor logs** regularly for suspicious activity

---

## Database Backup Script

Create backup script:
```bash
nano /var/www/gpdi-melati-depok-church-management-system/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/gpdi-melati"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump gpdi_melati -U gpdi_user > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x backup.sh
```

Add to crontab for daily backup:
```bash
crontab -e
```

Add line:
```
0 2 * * * /var/www/gpdi-melati-depok-church-management-system/backup.sh
```
