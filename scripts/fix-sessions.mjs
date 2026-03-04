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
    console.log('Restoring sessions (time slots)...');

    const defaultTimeSlots = [
        { id: '1', time: '8:00-10:00 AM', type: 'weekday' },
        { id: '2', time: '1:00-3:00 PM', type: 'weekday' },
        { id: '3', time: '3:00-5:00 PM', type: 'weekday' },
        { id: '4', time: '12:30-3:00 PM', type: 'weekend' },
        { id: '5', time: '3:00-5:30 PM', type: 'weekend' }
    ];

    const { data, error } = await client.from('config').upsert({ key: 'time_slots', value: defaultTimeSlots });

    if (error) {
        console.log('Error restoring:', error);
    } else {
        console.log('Successfully restored time slots! Refresh the app to see them.');
    }
}

run();
