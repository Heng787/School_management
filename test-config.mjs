import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function testConfig() {
    const { data, error } = await supabase.from('config').upsert({ key: 'test_key', value: ['test_value'] });
    console.log('Error:', error);
    console.log('Data:', data);

    const getCall = await supabase.from('config').select('*');
    console.log('Get Error:', getCall.error);
    console.log('Get Data:', getCall.data);
}

testConfig();
