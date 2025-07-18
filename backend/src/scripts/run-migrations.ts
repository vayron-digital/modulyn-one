import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    // Get all migration files from the migrations directory
    const migrationsDir = path.join(__dirname, '../../../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Found migration files:', migrationFiles);

    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        // Execute the SQL directly
        const { error } = await supabase.from('_sqlx').insert({ sql });
        if (error) {
          console.error(`Error running migration ${file}:`, error);
          process.exit(1);
        }
        console.log(`Successfully ran migration: ${file}`);
      } catch (error) {
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 