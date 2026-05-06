import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => {
        const parts = line.split('=');
        return [parts[0].trim(), parts[1].trim()];
    })
);

const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function run() {
    const { data: students, error } = await client.from('students').select('id, name');
    if (error) {
        console.error('Error fetching students:', error);
        return;
    }
    
    const idCounts = {};
    students.forEach(s => {
        idCounts[s.id] = (idCounts[s.id] || 0) + 1;
    });
    
    const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
    
    if (duplicates.length > 0) {
        console.log('Duplicate Student IDs found:');
        duplicates.forEach(([id, count]) => {
            const names = students.filter(s => s.id === id).map(s => s.name);
            console.log(`ID: ${id}, Count: ${count}, Names: ${names.join(', ')}`);
        });
    } else {
        console.log('No duplicate student IDs found in Supabase.');
    }
}

run();
