import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function run() {
    console.log('=== Checking All Enrollments in Supabase ===');
    const { data, error } = await client.from('enrollments').select('*');
    if (error) {
        console.error('Error fetching enrollments:', error);
        return;
    }

    console.log(`Found ${data.length} total enrollments.`);
    
    // Group by class
    const byClass = {};
    data.forEach(e => {
        if (!byClass[e.class_id]) byClass[e.class_id] = [];
        byClass[e.class_id].push(e);
    });

    for (const [classId, enrolls] of Object.entries(byClass)) {
        console.log(`\nClass: ${classId} (${enrolls.length} students)`);
        enrolls.forEach(e => {
            console.log(`  - Student: ${e.student_id}, ID: ${e.id}, Year: ${e.academic_year}`);
        });
    }
}

run();
