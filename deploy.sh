#!/bin/bash

# ============================================
# GPdI Melati Depok - Deployment Script
# ============================================
# Usage: ./deploy.sh
# This script will:
# 1. Backup current database
# 2. Pull latest code from GitHub
# 3. Install dependencies
# 4. Apply database migrations
# 5. Build and restart the application
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/gpdi-melati-depok-church-management-system"
DB_NAME="gpdi_melati"
DB_USER="gpdi_user"
BACKUP_DIR="/var/backups/gpdi-melati"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GPdI Melati Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Create backup directory if not exists
echo -e "${YELLOW}[1/7] Creating backup directory...${NC}"
mkdir -p $BACKUP_DIR
echo -e "${GREEN}✓ Backup directory ready${NC}"
echo ""

# Step 2: Backup database
echo -e "${YELLOW}[2/7] Backing up database...${NC}"
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database backed up to: $BACKUP_DIR/backup_$TIMESTAMP.sql${NC}"
else
    echo -e "${RED}✗ Database backup failed!${NC}"
    exit 1
fi
echo ""

# Step 3: Navigate to app directory
echo -e "${YELLOW}[3/7] Navigating to app directory...${NC}"
cd $APP_DIR
echo -e "${GREEN}✓ Current directory: $(pwd)${NC}"
echo ""

# Step 4: Pull latest code from GitHub
echo -e "${YELLOW}[4/7] Pulling latest code from GitHub...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code pulled successfully${NC}"
else
    echo -e "${RED}✗ Git pull failed!${NC}"
    exit 1
fi
echo ""

# Step 5: Install dependencies
echo -e "${YELLOW}[5/7] Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ npm install failed!${NC}"
    exit 1
fi
echo ""

# Step 6: Apply database migrations
echo -e "${YELLOW}[6/7] Applying database migrations...${NC}"

# Add columns to jemaat table
psql -U $DB_USER -d $DB_NAME <<EOF
ALTER TABLE jemaat 
ADD COLUMN IF NOT EXISTS wadah VARCHAR(100),
ADD COLUMN IF NOT EXISTS rayon VARCHAR(100),
ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(20);
EOF

# Update schedules table
psql -U $DB_USER -d $DB_NAME <<EOF
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS hari_jam VARCHAR(100),
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kuota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS terdaftar INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(50),
ADD COLUMN IF NOT EXISTS need_payment_proof BOOLEAN DEFAULT false;
EOF

# Update hero_slides table
psql -U $DB_USER -d $DB_NAME <<EOF
ALTER TABLE hero_slides
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS badge VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100),
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS event_name VARCHAR(255);
EOF

echo -e "${GREEN}✓ Database migrations applied${NC}"
echo ""

# Step 7: Build and restart application
echo -e "${YELLOW}[7/7] Building and restarting application...${NC}"
npm run build

# Check if using PM2
if command -v pm3 &> /dev/null; then
    pm2 restart gpdi-melati
    echo -e "${GREEN}✓ Application restarted with PM2${NC}"
elif systemctl is-active --quiet gpdi-melati; then
    systemctl restart gpdi-melati
    echo -e "${GREEN}✓ Application restarted with systemctl${NC}"
else
    echo -e "${YELLOW}⚠ Please restart your application manually${NC}"
fi
echo ""

# Final summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Database backup: $BACKUP_DIR/backup_$TIMESTAMP.sql"
echo "Application directory: $APP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify the application is running: pm2 status"
echo "2. Check application logs: pm2 logs gpdi-melati"
echo "3. Test the application in browser"
echo ""
