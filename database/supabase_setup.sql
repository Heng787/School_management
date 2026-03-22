-- SUPABASE SETUP SCRIPT
-- Run this in the Supabase SQL Editor to create the necessary tables and sync logic.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    academic_year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sex TEXT,
    dob DATE,
    phone TEXT,
    enrollment_date DATE,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    subject TEXT,
    contact TEXT,
    hire_date DATE,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT REFERENCES staff(id) ON DELETE SET NULL,
    schedule TEXT,
    level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    subject TEXT,
    score NUMERIC,
    term TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    date DATE,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT,
    record_id TEXT,
    action TEXT,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Batch Sync RPC Function
-- This function allows the app to send ALL local changes in one single network request.
CREATE OR REPLACE FUNCTION sync_school_data_v2(
    p_students JSONB[],
    p_staff JSONB[],
    p_classes JSONB[],
    p_enrollments JSONB[],
    p_grades JSONB[],
    p_attendance JSONB[],
    p_config JSONB[]
) RETURNS VOID 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    item JSONB;
BEGIN
    -- Upsert Students
    FOREACH item IN ARRAY p_students LOOP
        INSERT INTO students (id, name, sex, dob, phone, enrollment_date, status)
        VALUES (item->>'id', item->>'name', item->>'sex', NULLIF(item->>'dob', '')::DATE, item->>'phone', NULLIF(item->>'enrollment_date', '')::DATE, item->>'status')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, sex = EXCLUDED.sex, dob = EXCLUDED.dob, phone = EXCLUDED.phone, 
            enrollment_date = EXCLUDED.enrollment_date, status = EXCLUDED.status;
    END LOOP;

    -- Upsert Staff
    FOREACH item IN ARRAY p_staff LOOP
        INSERT INTO staff (id, name, role, subject, contact, hire_date, password)
        VALUES (item->>'id', item->>'name', item->>'role', item->>'subject', item->>'contact', NULLIF(item->>'hire_date', '')::DATE, item->>'password')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, role = EXCLUDED.role, subject = EXCLUDED.subject, 
            contact = EXCLUDED.contact, hire_date = EXCLUDED.hire_date, password = EXCLUDED.password;
    END LOOP;

    -- Upsert Classes
    FOREACH item IN ARRAY p_classes LOOP
        INSERT INTO classes (id, name, teacher_id, schedule, level)
        VALUES (item->>'id', item->>'name', item->>'teacher_id', item->>'schedule', item->>'level')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, teacher_id = EXCLUDED.teacher_id, schedule = EXCLUDED.schedule, level = EXCLUDED.level;
    END LOOP;

    -- Upsert Enrollments
    FOREACH item IN ARRAY p_enrollments LOOP
        INSERT INTO enrollments (id, student_id, class_id, academic_year)
        VALUES (item->>'id', item->>'student_id', item->>'class_id', item->>'academic_year')
        ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id, class_id = EXCLUDED.class_id, academic_year = EXCLUDED.academic_year;
    END LOOP;

    -- Upsert Grades
    FOREACH item IN ARRAY p_grades LOOP
        INSERT INTO grades (id, student_id, subject, score, term)
        VALUES (item->>'id', item->>'student_id', item->>'subject', (item->>'score')::NUMERIC, item->>'term')
        ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id, subject = EXCLUDED.subject, score = EXCLUDED.score, term = EXCLUDED.term;
    END LOOP;

    -- Upsert Attendance
    FOREACH item IN ARRAY p_attendance LOOP
        INSERT INTO attendance (id, student_id, date, status)
        VALUES (item->>'id', item->>'student_id', NULLIF(item->>'date', '')::DATE, item->>'status')
        ON CONFLICT (id) DO UPDATE SET
            student_id = EXCLUDED.student_id, date = EXCLUDED.date, status = EXCLUDED.status;
    END LOOP;

    -- Upsert Config
    FOREACH item IN ARRAY p_config LOOP
        INSERT INTO config (key, value)
        VALUES (item->>'key', item->'value')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Automatic Backup System (Recycle Bin)
-- This tracks all changes (Add, Edit, Delete) and saves them for 30 days.
CREATE TABLE IF NOT EXISTS system_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Backup Trigger Function
CREATE OR REPLACE FUNCTION handle_audit_backup()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    rec_id TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        rec_id := COALESCE(to_jsonb(OLD)->>'id', to_jsonb(OLD)->>'key', 'unknown');
        INSERT INTO system_backups (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, rec_id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        rec_id := COALESCE(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'key', 'unknown');
        INSERT INTO system_backups (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, rec_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        rec_id := COALESCE(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'key', 'unknown');
        INSERT INTO system_backups (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, rec_id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach Triggers to Tables
DO $$ 
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN SELECT table_name FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name IN ('students', 'staff', 'classes', 'grades', 'attendance', 'config')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_audit_%I ON %I', t_name, t_name);
        EXECUTE format('CREATE TRIGGER tr_audit_%I AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION handle_audit_backup()', t_name, t_name);
    END LOOP;
END $$;

-- Optional: Cleanup Function for old backups
-- You can run `SELECT cleanup_old_backups();` periodically to delete records older than 30 days.
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS VOID 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    DELETE FROM system_backups WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
