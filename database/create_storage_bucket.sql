-- Run this in the Supabase SQL Editor to create the public bucket for message attachments
-- Safe to re-run at any time (idempotent).

-- 1. Create the bucket (no-op if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies before re-creating (PostgreSQL has no CREATE POLICY IF NOT EXISTS)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert"   ON storage.objects;
DROP POLICY IF EXISTS "Auth Update"   ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete"   ON storage.objects;

-- 3. Allow everyone to read attachments
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

-- 4. Allow anyone to insert into attachments
CREATE POLICY "Auth Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments');

-- 5. Allow anyone to update attachments
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'attachments');

-- 6. Allow anyone to delete attachments
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments');
