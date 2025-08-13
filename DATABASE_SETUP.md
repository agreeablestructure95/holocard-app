# 🗄️ PostgreSQL Setup Guide for HoloCard

## 🚀 **Option 1: Supabase (RECOMMENDED - Easiest)**

### Why Supabase?
- ✅ **Completely FREE** (up to 500MB database)
- ✅ **No installation** required
- ✅ **Instant setup** (2 minutes)
- ✅ **Cloud hosted** - works from anywhere
- ✅ **Built-in dashboard** to view your data

### Setup Steps:
1. **Go to:** https://supabase.com/
2. **Click:** "Start your project" 
3. **Sign up** with your Google account
4. **Create New Project:**
   - Project name: `holocard-db`
   - Database password: Choose a strong password (save it!)
   - Region: Choose closest to you
5. **Wait 2 minutes** for project creation
6. **Get connection string:**
   - Go to Settings → Database
   - Scroll down to "Connection string"
   - Copy the URI format connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Update Your App:
```bash
# Edit backend/.env and replace the DATABASE_URL line with your Supabase URL:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 💻 **Option 2: Local PostgreSQL (Windows)**

### If you prefer local database:

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer
   - Run installer with default settings
   - **Remember the password you set for 'postgres' user**

2. **Create Database:**
   ```cmd
   # Open Command Prompt as Administrator
   psql -U postgres
   # Enter your password when prompted
   
   # Create database
   CREATE DATABASE holocard_dev;
   \q
   ```

3. **Update backend/.env:**
   ```bash
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/holocard_dev
   ```

---

## 🐳 **Option 3: Docker (If you want to install Docker)**

### Install Docker Desktop:
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Run this command:
   ```bash
   docker run --name holocard-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=holocard_dev -p 5432:5432 -d postgres:15
   ```
4. Update backend/.env:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/holocard_dev
   ```

---

## 🎯 **RECOMMENDED: Use Supabase**

**For your project, I recommend Supabase because:**
- No installation headaches
- Works immediately  
- Free tier is generous
- Easy to share with others
- Professional cloud hosting

---

## ✅ **After Database Setup**

1. **Test your connection:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Look for this message:**
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

3. **If you see errors:**
   - Check your DATABASE_URL is correct
   - Make sure database exists
   - Verify password is correct

---

## 🆘 **Troubleshooting**

### Common Issues:
- **"Connection refused"**: Database isn't running
- **"Authentication failed"**: Wrong password
- **"Database not found"**: Database name doesn't exist

### Quick Fixes:
- Double-check DATABASE_URL format
- Ensure no extra spaces in .env file
- Try connecting with a database client like pgAdmin

---

**Need help? The database setup is the last step before your app is fully functional!** 🚀
