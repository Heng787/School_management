import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function run() {
    const { data } = await client.from('enrollments').select('id, student_id, class_id');
    
    const room6 = data.filter(e => e.class_id === 'class_1772611464540');
    const room1 = data.filter(e => e.class_id === 'class_1773913231774');
    
    console.log(`Room 6 (${room6.length} students):`);
    room6.forEach(e => console.log(`  ${e.student_id}`));
    
    console.log(`\nRoom 1 (${room1.length} students):`);
    room1.forEach(e => console.log(`  ${e.student_id} (enrollment: ${e.id})`));
}

run();
