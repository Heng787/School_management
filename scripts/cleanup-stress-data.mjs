import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(url, key);

async function cleanup() {
    console.log('--- Cleaning up Stress Test Data ---');
    
    // 1. Delete students with stress-related IDs
    console.log('Deleting stress test students...');
    const { data: studentData, error: studentError } = await supabase
        .from('students')
        .delete()
        .like('id', 'student-stress-%');

    if (studentError) {
        console.error('Error deleting students:', studentError);
    } else {
        console.log('Successfully deleted stress test students.');
    }

    // 2. Delete other potential stress data (if any)
    console.log('Checking for other stress-related records...');
    
    // Check grades
    const { error: gradeError } = await supabase
        .from('grades')
        .delete()
        .like('student_id', 'student-stress-%');
        
    if (gradeError) console.error('Error deleting grades:', gradeError);

    // Check attendance
    const { error: attError } = await supabase
        .from('attendance')
        .delete()
        .like('student_id', 'student-stress-%');
        
    if (attError) console.error('Error deleting attendance:', attError);

    console.log('--- Cleanup Complete ---');
}

cleanup();
