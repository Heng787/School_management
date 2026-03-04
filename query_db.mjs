import { createClient } from '@supabase/supabase-js';

const url = 'https://okhkcrolpvnxokujcans.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raGtjcm9scHZueG9rdWpjYW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTA3ODUsImV4cCI6MjA4NjUyNjc4NX0.Gnhxf9oXQ3kqzm2ksaRZCLH5dqrHo4IVQ1tvO8BE7QU';

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.rpc('get_triggers_or_execute_sql', { sql: "SELECT * FROM information_schema.triggers WHERE event_object_table = 'staff'" });
    console.log(error || data);
}
check();
