import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Starting HoloCard database migration...');
    
    // Read migration SQL file (database folder is at root level)
    const migrationPath = join(__dirname, '../../../database/migrations.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await query(migrationSQL);
    
    console.log('✅ Database migration completed successfully!');
    console.log('📋 Migration summary:');
    console.log('   - Created users table with UUID primary key');
    console.log('   - Created cards table with foreign key to users');
    console.log('   - Added indexes for optimal query performance');
    console.log('   - Set up automatic timestamp triggers');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration();
}

export { runMigration };
