import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'src', 'db', 'migrations', 'add_status_to_order_profile.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 