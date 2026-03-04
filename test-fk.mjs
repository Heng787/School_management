import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;
const client = createClient(url, key);

async function run() {
    console.log('Querying students table...');
    const { data: students, error: studentError } = await client.from('students').select('*');
    console.log('Students in DB:', students);

    console.log('\nQuerying classes table...');
    const { data: classes, error: classError } = await client.from('classes').select('*');
    console.log('Classes in DB:', classes);

    console.log('\nTrying to upsert a dummy enrollment using a student that might be missing...');
    const dummyEnrollment = {
        id: 'test_enr_123',
        student_id: 's7',
        class_id: classes && classes.length > 0 ? classes[0].id : 'unknown_class',
        academic_year: '2026'
    };

    const { data: upsertData, error: upsertError } = await client.from('enrollments').upsert([dummyEnrollment]);
    console.log('Upsert Error:', upsertError);

    // Cleanup
    if (!upsertError) {
        await client.from('enrollments').delete().eq('id', 'test_enr_123');
    }
}

run();
