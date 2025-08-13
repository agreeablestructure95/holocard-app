import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateDatabase() {
  try {
    console.log('🔄 Updating database schema...');
    
    // Read the update SQL file
    const updateSqlPath = path.join(__dirname, '../../database/update_cards_constraint.sql');
    const updateSql = fs.readFileSync(updateSqlPath, 'utf8');
    
    // Execute the update
    await query(updateSql);
    
    console.log('✅ Database schema updated successfully!');
    console.log('   - Added unique constraint to cards.user_id');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
    
    // Check if the constraint already exists
    if (error.message.includes('already exists')) {
      console.log('✅ Constraint already exists, skipping...');
    } else {
      throw error;
    }
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  updateDatabase()
    .then(() => {
      console.log('Database update complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database update failed:', error);
      process.exit(1);
    });
}

export { updateDatabase };
