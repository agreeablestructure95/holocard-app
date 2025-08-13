# HoloCard Deployment Guide

This guide covers deploying HoloCard to production environments.

## 📋 Prerequisites

- Domain name (for HTTPS - required for AR)
- Google OAuth credentials
- PostgreSQL database
- Cloudinary account (optional)
- 8th Wall account (optional)

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL (Recommended)

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from the Connect tab
4. Run migration:

```bash
# Connect to database and run migration
psql "your-database-url-here" -f database/migrations.sql
```

### Option 2: Render PostgreSQL

1. Sign up at [render.com](https://render.com)
2. Create new PostgreSQL database
3. Use the connection string in your backend

### Option 3: Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create database and get connection string
3. Run migrations via their SQL editor

## 🚀 Backend Deployment

### Railway Deployment (Recommended)

1. Fork the repository to your GitHub
2. Connect Railway to your GitHub account
3. Create new project → Deploy from GitHub
4. Select the backend folder
5. Set environment variables:

```env
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

6. Deploy and note the backend URL

### Render Deployment

1. Connect GitHub repository
2. Create new Web Service
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Set environment variables (same as above)

### Using Dockerfile

```bash
# Build image
cd backend
docker build -t holocard-backend .

# Run container
docker run -p 3001:3001 --env-file .env holocard-backend
```

## 🌐 Frontend Deployment

### Vercel Deployment (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. In frontend directory:

```bash
# Build and deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_8THWALL_APP_KEY
vercel env add VITE_APP_URL

# Redeploy with new environment
vercel --prod
```

Or use Vercel dashboard:
1. Connect GitHub repository
2. Set build settings:
   - Framework: Vite
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/dist`
3. Add environment variables
4. Deploy

### Netlify Deployment

1. Build locally:
```bash
cd frontend
npm run build
```

2. Drag `dist` folder to Netlify or use CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. Set environment variables in Netlify dashboard

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `https://your-frontend-domain.vercel.app`
   - `https://your-backend-domain.railway.app` (for backend)
6. Add authorized redirect URIs:
   - `https://your-frontend-domain.vercel.app/auth/callback`

## 🌟 8th Wall Setup (Optional)

1. Sign up at [8thwall.com](https://8thwall.com)
2. Create new project
3. Get App Key from project settings
4. Add domain to allowed origins
5. Set `VITE_8THWALL_APP_KEY` and `VITE_ENABLE_8THWALL=true`

## ☁️ Cloudinary Setup (Optional)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from dashboard
3. Set environment variables in backend
4. Enable unsigned uploads for better UX (optional)

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/health
```

### Frontend Smoke Test
1. Visit your frontend URL
2. Test Google sign-in
3. Create a profile
4. Generate QR code
5. Test AR on mobile device

### Two-Phone Test
1. Sign in with different Google accounts on two phones
2. Create cards on both devices
3. Share QR codes between devices
4. Test AR viewing on both phones

## 📊 Monitoring & Analytics

### Backend Monitoring
- Railway provides built-in metrics
- Add logging service like LogTail or Datadog
- Set up uptime monitoring

### Frontend Analytics
- Add Google Analytics
- Monitor Core Web Vitals
- Track AR usage with custom events

## 🔧 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure FRONTEND_URL is set correctly in backend
- Check domain spelling and protocols (https)

**AR Not Working:**
- Verify HTTPS is enabled
- Check camera permissions
- Test on physical devices, not simulators

**Database Connection:**
- Verify DATABASE_URL format
- Check firewall settings
- Ensure SSL is configured properly

**Google OAuth Errors:**
- Verify client ID and secret
- Check authorized domains
- Ensure redirect URIs are correct

### Performance Optimization

**Backend:**
- Enable compression
- Add caching headers
- Use CDN for static assets

**Frontend:**
- Enable Vercel/Netlify edge caching
- Optimize images
- Lazy load AR components

## 🔒 Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables set securely
- [ ] Google OAuth properly configured
- [ ] Database uses SSL connections
- [ ] JWT secrets are strong and unique
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info

## 📱 Mobile App (Future)

For native mobile apps:
- Use Capacitor.js for hybrid app
- Implement native AR frameworks
- Add app store deployment

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in deployment platforms
3. Test locally with production environment variables
4. Create an issue on GitHub with details

---

**Need Help?** Create an issue in the GitHub repository with your deployment logs and error details.
