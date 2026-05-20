# Database Setup Guide

## Quick Start

To set up the Tree Felling Reports database schema in your Supabase project:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration

1. Open the file `supabase/migrations/001_create_reports_schema.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Setup

Run this verification query in the SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reports', 'report_history');

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'report-photos';
```

You should see:
- Two tables: `reports` and `report_history`
- One storage bucket: `report-photos`

## What Gets Created

### Tables
- **reports**: Main table for tree felling reports with GPS coordinates, photos, and status
- **report_history**: Audit log for tracking status changes

### Storage
- **report-photos**: Public bucket for storing photo evidence (max 5MB per file)

### Security
- Row Level Security (RLS) enabled with public read/write policies
- Input validation constraints on coordinates, text length, and photo count

## Testing

The coordinate validation has been tested with property-based tests. Run tests with:

```bash
npm test
```

All 5 property tests for GPS coordinate validation passed successfully, covering:
- Valid coordinates within range
- Invalid latitude rejection
- Invalid longitude rejection  
- Boundary value acceptance
- NaN and non-numeric value rejection

## Next Steps

After setting up the database:
1. Ensure your `.env` file has the correct Supabase credentials
2. Test the connection by running the app: `npm run dev`
3. Proceed to the next task: Remove Authentication System
