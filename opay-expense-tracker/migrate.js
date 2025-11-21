const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fpjvwyaysvcklojntggf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwanZ3eWF5c3Zja2xvam50Z2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTM5MzEsImV4cCI6MjA3NzU2OTkzMX0.YNJQ6FBPAVifhUo2EnTLENEij3m7IWZhQ30cSfLufw8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration to add income tracking support...');
  
  try {
    // Note: This migration should be run via Supabase dashboard SQL editor
    console.log('\nPlease run the following SQL in Supabase dashboard:');
    console.log('-----------------------------------------------');
    console.log(`
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income'));
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
UPDATE expenses SET type = 'expense' WHERE type IS NULL;
    `);
    console.log('-----------------------------------------------\n');
    
    console.log('Migration SQL generated. Please apply manually in Supabase dashboard.');
    console.log('Dashboard URL: https://supabase.com/dashboard/project/fpjvwyaysvcklojntggf/editor');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();
