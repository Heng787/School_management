-- ============================================================
-- SCHOOL ADMIN — SUPABASE FINAL SETUP SCRIPT
-- Safe to re-run at any time (idempotent).
-- ============================================================

-- ============================================================
-- SECTION 1: TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    sex              TEXT,
    dob              DATE,
    phone            TEXT,
    enrollment_date  DATE,
    status           TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    role        TEXT,
    subject     TEXT,
    contact     TEXT,
    hire_date   DATE,
    password    TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    teacher_id  TEXT REFERENCES staff(id) ON DELETE SET NULL,
    schedule    TEXT,
    level       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id             TEXT PRIMARY KEY,
    student_id     TEXT REFERENCES students(id) ON DELETE CASCADE,
    class_id       TEXT REFERENCES classes(id)  ON DELETE CASCADE,
    academic_year  TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grades (
    id          TEXT PRIMARY KEY,
    student_id  TEXT REFERENCES students(id) ON DELETE CASCADE,
    subject     TEXT,
    score       NUMERIC,
    term        TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
    id          TEXT PRIMARY KEY,
    student_id  TEXT REFERENCES students(id) ON DELETE CASCADE,
    date        DATE,
    status      TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_permissions (
    id          TEXT PRIMARY KEY,
    staff_id    TEXT REFERENCES staff(id) ON DELETE CASCADE,
    type        TEXT,
    start_date  DATE,
    end_date    DATE,
    reason      TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS config (
    key         TEXT PRIMARY KEY,
    value       JSONB,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    date        DATE,
    type        TEXT,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id           TEXT PRIMARY KEY,
    sender_id    TEXT,
    sender_name  TEXT,
    recipient_id TEXT,
    type         TEXT DEFAULT 'message',
    content      TEXT,
    metadata     JSONB DEFAULT '{}',
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_backups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name  TEXT NOT NULL,
    record_id   TEXT NOT NULL,
    action      TEXT NOT NULL,   
    old_data    JSONB,
    new_data    JSONB,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at  TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================================
-- SECTION 2: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_student  ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class     ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student        ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student    ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date       ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_staff ON staff_permissions(staff_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient    ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created      ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_table  ON system_backups(table_name);
CREATE INDEX IF NOT EXISTS idx_system_backups_exp    ON system_backups(expires_at);

-- ============================================================
-- SECTION 3: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff             ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE config            ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for students"          ON students;
CREATE POLICY          "Allow all for students"          ON students          FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for staff"             ON staff;
CREATE POLICY          "Allow all for staff"             ON staff             FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for classes"           ON classes;
CREATE POLICY          "Allow all for classes"           ON classes           FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for enrollments"       ON enrollments;
CREATE POLICY          "Allow all for enrollments"       ON enrollments       FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for grades"            ON grades;
CREATE POLICY          "Allow all for grades"            ON grades            FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for attendance"        ON attendance;
CREATE POLICY          "Allow all for attendance"        ON attendance        FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for staff_permissions" ON staff_permissions;
CREATE POLICY          "Allow all for staff_permissions" ON staff_permissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for config"            ON config;
CREATE POLICY          "Allow all for config"            ON config            FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for events"            ON events;
CREATE POLICY          "Allow all for events"            ON events            FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for messages"          ON messages;
CREATE POLICY          "Allow all for messages"          ON messages          FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for system_backups"    ON system_backups;
CREATE POLICY          "Allow all for system_backups"    ON system_backups    FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- SECTION 4: STORAGE — signatures bucket
-- DO NOT manage storage.objects policies via SQL.
-- Supabase auto-creates a "Public Access" policy when you toggle
-- a bucket to Public in the dashboard, and that policy is owned
-- by the storage service role — it CANNOT be created or dropped
-- via the SQL Editor (error 42710 / permission denied).
--
-- Instead, configure the "signatures" bucket through the UI:
--   Supabase Dashboard → Storage → signatures → Policies
-- Set it to Public, or add your own policies there.
-- ============================================================

-- ============================================================
-- SECTION 5: AUDIT TRIGER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_audit_backup()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
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
$$;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['students','staff','classes','grades','attendance','config']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_audit_%I ON %I', t, t);
        EXECUTE format(
            'CREATE TRIGGER tr_audit_%I
             AFTER INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION handle_audit_backup()',
            t, t
        );
    END LOOP;
END $$;
