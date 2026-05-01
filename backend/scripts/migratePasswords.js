require('dotenv').config();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Fetching all staff members...');
  const { data: staffList, error: fetchError } = await supabase.from('staff').select('id, password');
  
  if (fetchError) {
    console.error('Failed to fetch staff:', fetchError);
    return;
  }

  let migratedCount = 0;

  for (const staff of staffList) {
    if (!staff.password) continue;
    
    // Check if already hashed
    if (staff.password.startsWith('$2b$')) {
      continue;
    }

    console.log(`Hashing password for user ID: ${staff.id}`);
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    
    const { error: updateError } = await supabase
      .from('staff')
      .update({ password: hashedPassword })
      .eq('id', staff.id);

    if (updateError) {
      console.error(`Failed to update password for ${staff.id}:`, updateError);
    } else {
      migratedCount++;
    }
  }

  console.log(`Migration complete. Successfully hashed ${migratedCount} plain text passwords.`);
}

migrate();
