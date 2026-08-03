#!/bin/bash

# Diagnostic Script for GPdI Melati Church Management System
# Run this script on the production server to diagnose issues

echo "=========================================="
echo "DIAGNOSTIC SCRIPT - GPdI Melati Server"
echo "=========================================="
echo ""

# 1. Check current directory and git status
echo "1. Checking Git Status..."
cd /var/www/gpdi-melati-depok-church-management-system
git status
echo ""
git log --oneline -5
echo ""

# 2. Check if .env file exists and DATABASE_URL
echo "2. Checking .env file..."
if [ -f .env ]; then
    echo ".env file exists"
    echo "DATABASE_URL:"
    grep DATABASE_URL .env || echo "DATABASE_URL not found in .env"
else
    echo ".env file NOT found - THIS IS A PROBLEM"
fi
echo ""

# 3. Check database connection
echo "3. Testing Database Connection..."
sudo -u postgres psql -d gpdi_melati -c "SELECT version();" || echo "Database connection failed"
echo ""

# 4. Check database columns
echo "4. Checking Database Columns..."
sudo -u postgres psql -d gpdi_melati -c "\d announcements" | grep -E "(ringkasan|isi|penting|gambar_url)" || echo "Missing columns in announcements"
sudo -u postgres psql -d gpdi_melati -c "\d warta_jemaat" | grep -E "(edisi|tema_minggu|ayat_minggu|pengumuman)" || echo "Missing columns in warta_jemaat"
sudo -u postgres psql -d gpdi_melati -c "\d registrations" | grep -E "(rayon|jenis_kegiatan|tanggal_daftar)" || echo "Missing columns in registrations"
echo ""

# 5. Check if server is running
echo "5. Checking Server Process..."
pm2 list || echo "PM2 not running"
systemctl status gpdi-melati 2>/dev/null || echo "Systemd service not found"
ps aux | grep -E "(node|npm)" | grep -v grep || echo "No node processes found"
echo ""

# 6. Check server logs
echo "6. Checking Recent Server Logs..."
pm2 logs gpdi-melati --lines 20 --nostream 2>/dev/null || echo "Cannot read PM2 logs"
journalctl -u gpdi-melati -n 20 --no-pager 2>/dev/null || echo "Cannot read systemd logs"
echo ""

# 7. Check API endpoints
echo "7. Testing API Endpoints..."
echo "Testing /api/health..."
curl -s http://localhost:3000/api/health || echo "Health check failed"
echo ""
echo "Testing /api/jemaat..."
curl -s http://localhost:3000/api/jemaat || echo "Jemaat endpoint failed"
echo ""
echo "Testing /api/announcements..."
curl -s http://localhost:3000/api/announcements || echo "Announcements endpoint failed"
echo ""

# 8. Check if TypeScript build exists
echo "8. Checking Build Output..."
if [ -d dist ]; then
    echo "dist directory exists"
    ls -la dist/ | head -10
else
    echo "dist directory NOT found - need to run npm run build"
fi
echo ""

# 9. Check node_modules
echo "9. Checking node_modules..."
if [ -d node_modules ]; then
    echo "node_modules exists"
    ls node_modules | head -5
else
    echo "node_modules NOT found - need to run npm install"
fi
echo ""

# 10. Check package.json scripts
echo "10. Checking package.json scripts..."
cat package.json | grep -A 10 '"scripts"' || echo "Cannot read package.json"
echo ""

echo "=========================================="
echo "DIAGNOSTIC COMPLETE"
echo "=========================================="
