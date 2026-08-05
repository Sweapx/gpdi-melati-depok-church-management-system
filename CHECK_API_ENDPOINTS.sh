#!/bin/bash

# API Endpoint Check Script
# GPdI Melati Depok Church Management System
# Run this script to check if API endpoints are responding correctly

BASE_URL="https://gpdimelati.me"

echo "=== API ENDPOINT CHECK ==="
echo "Base URL: $BASE_URL"
echo ""

# 1. Check Auth Login
echo "1. Testing POST /api/auth/login"
response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "Response: $response"
echo ""

# 2. Check Admin Users
echo "2. Testing GET /api/admin-users"
response=$(curl -s -X GET "$BASE_URL/api/admin-users")
echo "Response: $response"
echo ""

# 3. Check Jemaat
echo "3. Testing GET /api/jemaat"
response=$(curl -s -X GET "$BASE_URL/api/jemaat")
echo "Response: $response"
echo ""

# 4. Check Schedules
echo "4. Testing GET /api/schedules"
response=$(curl -s -X GET "$BASE_URL/api/schedules")
echo "Response: $response"
echo ""

# 5. Check Hero Slides
echo "5. Testing GET /api/hero-slides"
response=$(curl -s -X GET "$BASE_URL/api/hero-slides")
echo "Response: $response"
echo ""

# 6. Check Announcements
echo "6. Testing GET /api/announcements"
response=$(curl -s -X GET "$BASE_URL/api/announcements")
echo "Response: $response"
echo ""

# 7. Check Warta Jemaat
echo "7. Testing GET /api/warta-jemaat"
response=$(curl -s -X GET "$BASE_URL/api/warta-jemaat")
echo "Response: $response"
echo ""

# 8. Check Registrations
echo "8. Testing GET /api/registrations"
response=$(curl -s -X GET "$BASE_URL/api/registrations")
echo "Response: $response"
echo ""

echo "=== ENDPOINT CHECK COMPLETE ==="
