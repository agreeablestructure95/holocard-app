# 🌟 HoloCard - AR Business Card Maker

> **Your Business, Holographically**

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://vercel.com)
[![Mobile Ready](https://img.shields.io/badge/mobile-optimized-blue)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![AR Enabled](https://img.shields.io/badge/AR-WebXR%20%7C%20Three.js-purple)](https://immersiveweb.dev/)

A cutting-edge, **mobile-first** web application that creates **AR-enabled business cards** with instant QR code sharing and real-time 3D overlays. Works perfectly on all phones and can be installed as a native app.

## 📱 Live Demo
🚀 **[Try HoloCard Live](https://your-app.vercel.app)** (Deploy to get this link!)

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure one-click sign-in
- 👤 **Smart Profile Editor** - Drag & drop image upload with focus-friendly inputs  
- 📱 **Mobile-First Design** - Responsive UI that feels native on phones
- 🥽 **WebAR Experience** - 3D business card viewer with touch controls
- 📊 **QR Code Sharing** - Instant sharing between phones
- ⚡ **PWA Ready** - Install as native app on any device
- 🌐 **Global CDN** - Lightning-fast loading worldwide

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** - Modern, fast development
- **TailwindCSS** - Mobile-first styling
- **Three.js** - 3D graphics and AR rendering
- Google Identity Services
- 8th Wall WebAR / MindAR.js
- QR Code generation

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Cloudinary (image storage)
- Google OAuth validation

## 📱 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google OAuth credentials
- Cloudinary account (optional)
- 8th Wall account (optional)

### Local Development

1. **Clone and Install**
```bash
cd holocard-app
npm install
```

2. **Database Setup**
```bash
# Create PostgreSQL database
psql -c "CREATE DATABASE holocard_dev;"

# Run migrations
psql -d holocard_dev -f database/migrations.sql
```

3. **Environment Setup**
```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your credentials

# Frontend
cp frontend/.env.example frontend/.env
# Fill in your credentials
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - HTTPS Tunnel (for AR testing)
npx ngrok http 5173
```

5. **Test on Mobile**
- Use ngrok HTTPS URL on two different phones
- Sign in with different Google accounts
- Test AR functionality

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Render/Railway)
```bash
cd backend
# Deploy with provided Dockerfile
```

### Database
- Use free PostgreSQL from Railway, Render, or Neon
- Run migration SQL from `database/migrations.sql`

## 📋 Testing Checklist

- [ ] Google OAuth login works on mobile
- [ ] Profile creation and editing
- [ ] Image upload and preview
- [ ] QR code generation and sharing
- [ ] Public card page loads correctly
- [ ] AR overlay works on two different phones
- [ ] Tap-to-place, pinch-to-scale, drag-to-move interactions
- [ ] 8th Wall primary, MindAR fallback

## 🔒 Security Features

- JWT-based session management
- Google token validation
- CORS protection
- Rate limiting
- Input validation
- Secure cookie handling

## 📄 License

MIT License - see LICENSE file for details
