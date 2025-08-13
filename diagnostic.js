#!/usr/bin/env node

/**
 * HoloCard App Diagnostic Script
 * Run this to check if all components are working
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class HoloCardDiagnostic {
  constructor() {
    this.results = {};
  }

  async checkEnvironmentFiles() {
    console.log('🔍 Checking environment files...');
    
    const backendEnv = path.join(process.cwd(), 'backend', '.env');
    const frontendEnv = path.join(process.cwd(), 'frontend', '.env');
    
    this.results.backendEnv = fs.existsSync(backendEnv);
    this.results.frontendEnv = fs.existsSync(frontendEnv);
    
    console.log(`   Backend .env: ${this.results.backendEnv ? '✅' : '❌'}`);
    console.log(`   Frontend .env: ${this.results.frontendEnv ? '✅' : '❌'}`);
  }

  async checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
      // Check backend dependencies
      const { stdout: backendDeps } = await execAsync('cd backend && npm ls --depth=0');
      this.results.backendDeps = !backendDeps.includes('UNMET DEPENDENCY');
      
      // Check frontend dependencies  
      const { stdout: frontendDeps } = await execAsync('cd frontend && npm ls --depth=0');
      this.results.frontendDeps = !frontendDeps.includes('UNMET DEPENDENCY');
      
    } catch (error) {
      console.log(`   Error checking dependencies: ${error.message}`);
      this.results.backendDeps = false;
      this.results.frontendDeps = false;
    }
    
    console.log(`   Backend deps: ${this.results.backendDeps ? '✅' : '❌'}`);
    console.log(`   Frontend deps: ${this.results.frontendDeps ? '✅' : '❌'}`);
  }

  async checkPorts() {
    console.log('🔍 Checking if ports are available...');
    
    try {
      // Check if backend port 5000 is free
      await execAsync('netstat -an | findstr :5000');
      this.results.port5000Available = false; // Port in use
    } catch {
      this.results.port5000Available = true; // Port free
    }
    
    try {
      // Check if frontend port 3000 is free
      await execAsync('netstat -an | findstr :3000');  
      this.results.port3000Available = false; // Port in use
    } catch {
      this.results.port3000Available = true; // Port free
    }
    
    console.log(`   Port 5000 (backend): ${this.results.port5000Available ? '🟢 Available' : '🟡 In use'}`);
    console.log(`   Port 3000 (frontend): ${this.results.port3000Available ? '🟢 Available' : '🟡 In use'}`);
  }

  async generateStartupCommands() {
    console.log('\n🚀 STARTUP COMMANDS:');
    console.log('='.repeat(50));
    
    console.log('\n1. Start Backend Server:');
    console.log('   cd backend');
    console.log('   npm run dev');
    
    console.log('\n2. Start Frontend (in a new terminal):');
    console.log('   cd frontend');  
    console.log('   npm run dev');
    
    console.log('\n3. Access the app:');
    console.log('   🌐 Frontend: http://localhost:3000');
    console.log('   🔧 Backend API: http://localhost:5000');
    console.log('   🩺 Health check: http://localhost:5000/health');
  }

  async generateTroubleshootingGuide() {
    console.log('\n🔧 TROUBLESHOOTING GUIDE:');
    console.log('='.repeat(50));
    
    if (!this.results.backendDeps || !this.results.frontendDeps) {
      console.log('\n❌ Missing Dependencies:');
      console.log('   cd backend && npm install');
      console.log('   cd frontend && npm install');
    }
    
    if (!this.results.backendEnv || !this.results.frontendEnv) {
      console.log('\n❌ Missing Environment Files:');
      console.log('   Copy .env.example to .env in both backend and frontend folders');
      console.log('   Fill in the required API keys');
    }
    
    console.log('\n🔧 Common Issues & Solutions:');
    console.log('   • Image upload fails: Check Cloudinary credentials in backend/.env');
    console.log('   • Login fails: Check Google OAuth credentials in backend/.env');
    console.log('   • Database errors: Check DATABASE_URL in backend/.env');
    console.log('   • AR not working: Make sure Three.js is loaded (should work automatically)');
    console.log('   • CORS errors: Ensure backend is running on port 5000');
    
    console.log('\n📱 Testing Steps:');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Click "Sign In with Google"');
    console.log('   3. Go to Dashboard');
    console.log('   4. Try uploading an image');
    console.log('   5. Check AR viewer');
  }

  async run() {
    console.log('🔎 HoloCard App Diagnostic');
    console.log('='.repeat(50));
    
    await this.checkEnvironmentFiles();
    await this.checkDependencies();
    await this.checkPorts();
    await this.generateStartupCommands();
    await this.generateTroubleshootingGuide();
    
    console.log('\n✅ Diagnostic complete!');
  }
}

// Run diagnostic
const diagnostic = new HoloCardDiagnostic();
diagnostic.run().catch(console.error);
