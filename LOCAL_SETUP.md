# HoloCard Local Development Setup

This guide helps you set up HoloCard for local development and testing.

## 🚀 Quick Setup

### 1. Prerequisites

Install the following on your development machine:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **ngrok** (for HTTPS testing) - [Download here](https://ngrok.com/download)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/holocard-app.git
cd holocard-app

# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 3. Database Setup

**Option A: Local PostgreSQL**

```bash
# Create database
createdb holocard_dev

# Run migrations
psql -d holocard_dev -f database/migrations.sql
```

**Option B: Docker PostgreSQL**

```bash
# Run PostgreSQL in Docker
docker run --name holocard-postgres \
  -e POSTGRES_DB=holocard_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Wait for container to start, then run migrations
sleep 10
psql "postgresql://postgres:password@localhost:5432/holocard_dev" -f database/migrations.sql
```

### 4. Environment Configuration

**Backend Environment:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
DATABASE_URL=postgresql://postgres:password@localhost:5432/holocard_dev
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://localhost:5173
```

**Frontend Environment:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_8THWALL_APP_KEY=your-8thwall-app-key
VITE_ENABLE_8THWALL=false
VITE_ENABLE_MINDAR=true
VITE_APP_URL=http://localhost:5173
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:5173`
   - `http://localhost:3001`
   - `https://your-ngrok-url.ngrok.io` (for mobile testing)
6. Copy Client ID and Secret to environment files

### 6. Start Development Servers

**Option A: Run All Services**
```bash
# From project root
npm run dev
```

**Option B: Run Individually**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 7. HTTPS for Mobile Testing

AR features require HTTPS. Use ngrok to create a secure tunnel:

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to frontend
ngrok http 5173

# Use the HTTPS URL for mobile testing
# Update Google OAuth settings with ngrok URL
```

## 🧪 Testing

### Local Testing Checklist

- [ ] Backend health check: `curl http://localhost:3001/health`
- [ ] Frontend loads: Open `http://localhost:5173`
- [ ] Google sign-in works
- [ ] Profile creation and editing
- [ ] Image upload (if Cloudinary configured)
- [ ] QR code generation
- [ ] Public card viewing
- [ ] AR experience (via ngrok HTTPS URL)

### Two-Device Testing

1. Set up ngrok HTTPS tunnel
2. Update Google OAuth with ngrok URL
3. Test on two different devices/browsers
4. Sign in with different Google accounts
5. Create profiles on both devices
6. Share QR codes between devices
7. Test AR functionality

## 🛠️ Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Database Tools

- **pgAdmin** - GUI for PostgreSQL
- **DBeaver** - Universal database tool
- **TablePlus** - Modern database client

### API Testing

- **Postman** - API testing tool
- **Insomnia** - REST client
- **curl** - Command line tool

Example API tests:
```bash
# Health check
curl http://localhost:3001/health

# Test CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001/api/auth/google
```

## 🐛 Debugging

### Backend Debugging

Enable debug logging:
```bash
DEBUG=holocard:* npm run dev
```

Common issues:
- Database connection errors
- CORS configuration
- Google OAuth setup
- Environment variable typos

### Frontend Debugging

Use browser developer tools:
- Console for JavaScript errors
- Network tab for API calls
- Application tab for storage inspection

Common issues:
- Google Sign-in button not appearing
- AR initialization failures
- API call failures (check CORS)

### AR Debugging

- Test on physical devices only
- Check browser console for WebRTC errors
- Verify HTTPS access
- Test camera permissions

## 📁 Project Structure

```
holocard-app/
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── scripts/        # Utility scripts
│   ├── Dockerfile          # Docker configuration
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── ar/             # AR-specific components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── public/             # Static assets
│   └── package.json
├── database/               # Database migrations
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # Project overview
```

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test Locally**
   - Run all services
   - Test on multiple devices
   - Verify AR functionality

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Deploy to Staging**
   - Test on staging environment
   - Verify with production data

6. **Create Pull Request**
   - Include testing checklist
   - Add screenshots/videos
   - Request code review

## 🆘 Getting Help

### Documentation
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

### Community
- Create GitHub issues for bugs
- Join Discord/Slack for discussions
- Check Stack Overflow for common issues

### Support
- Include logs and error messages
- Describe steps to reproduce
- Mention your environment details
