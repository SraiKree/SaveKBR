# Supabase Database Setup

This directory contains SQL migration files for setting up the Tree Felling Reports database schema.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for Development)

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/001_create_reports_schema.sql`
4. Paste into the SQL Editor and run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Schema Overview

### Tables

#### `reports`
Main table for storing tree felling reports with the following fields:
- `id` (UUID): Primary key
- `reporter_name` (VARCHAR(100)): Name of the person submitting the report
- `description` (TEXT): Description of the incident (max 500 chars)
- `lat` (DECIMAL): Latitude coordinate (-90 to 90)
- `lng` (DECIMAL): Longitude coordinate (-180 to 180)
- `status` (VARCHAR(20)): Report status ('active', 'resolved', 'dismissed')
- `photo_urls` (TEXT[]): Array of photo URLs (1-3 photos)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Constraints:**
- Description max length: 500 characters
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Status must be one of: 'active', 'resolved', 'dismissed'
- Photo URLs array must contain 1-3 items

**Indexes:**
- `idx_reports_status`: Index on status field for filtering
- `idx_reports_created_at`: Index on created_at field for sorting

#### `report_history`
Audit log table for tracking status changes:
- `id` (UUID): Primary key
- `report_id` (UUID): Foreign key to reports table
- `old_status` (VARCHAR(20)): Previous status
- `new_status` (VARCHAR(20)): New status
- `admin_identifier` (VARCHAR(100)): Identifier of admin who made the change
- `changed_at` (TIMESTAMP): Timestamp of the change

**Indexes:**
- `idx_report_history_report_id`: Index on report_id for lookups

### Storage

#### `report-photos` Bucket
- Public read access enabled
- Stores uploaded photo evidence
- Recommended file naming: `{report_id}/{timestamp}_{random}.{ext}`

### Row Level Security (RLS)

RLS is enabled on both tables with the following policies:

**reports table:**
- Public read access (SELECT)
- Public insert access (INSERT)
- Public update access (UPDATE) - for admin actions

**report_history table:**
- Public read access (SELECT)
- Public insert access (INSERT)

**Storage policies:**
- Public read access to report-photos bucket
- Public upload access to report-photos bucket

## Verification

After running the migration, verify the setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reports', 'report_history');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reports', 'report_history');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'report-photos';
```

## Notes

- All timestamps are stored in UTC with timezone information
- The schema enforces data integrity through database constraints
- RLS policies allow public access since this is an open reporting system
- Admin actions are tracked in the report_history table for accountability
