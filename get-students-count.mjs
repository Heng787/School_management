import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing URL or KEY');
    process.exit(1);
}

const client = createClient(url, key);

async function run() {
    const { count, error } = await client
        .from('students')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching students count:', error);
    } else {
        console.log(`There are currently ${count} students in the database.`);
    }
}

run();
