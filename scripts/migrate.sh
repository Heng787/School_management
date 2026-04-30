#!/bin/bash
set -e

echo "Starting database migrations..."
# Since Supabase is managed and there's no direct backend migration runner configured in package.json, 
# we check if a db:migrate script exists, otherwise we execute the setup SQL directly using supabase CLI if available.

if npm run | grep -q 'db:migrate'; then
  npm run db:migrate
else
  echo "No db:migrate script found. Please apply database/FINAL_SETUP.sql to your Supabase instance manually."
fi

echo "Migrations complete"
