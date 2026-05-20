-- Create reports table with validation constraints
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  lat DECIMAL(10, 8) NOT NULL CHECK (lat >= -90 AND lat <= 90),
  lng DECIMAL(11, 8) NOT NULL CHECK (lng >= -180 AND lng <= 180),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  photo_urls TEXT[] NOT NULL CHECK (array_length(photo_urls, 1) BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Create report_history audit log table
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  admin_identifier VARCHAR(100),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for report history lookups
CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON report_history(report_id);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to reports
CREATE POLICY "Public read access to reports"
  ON reports
  FOR SELECT
  USING (true);

-- Create policy for public insert access to reports
CREATE POLICY "Public insert access to reports"
  ON reports
  FOR INSERT
  WITH CHECK (true);

-- Create policy for public update access to reports (for admin actions)
CREATE POLICY "Public update access to reports"
  ON reports
  FOR UPDATE
  USING (true);

-- Create policy for public read access to report history
CREATE POLICY "Public read access to report history"
  ON report_history
  FOR SELECT
  USING (true);

-- Create policy for public insert access to report history
CREATE POLICY "Public insert access to report history"
  ON report_history
  FOR INSERT
  WITH CHECK (true);

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public read access
CREATE POLICY "Public read access to report photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'report-photos');

-- Create storage policy for public upload access
CREATE POLICY "Public upload access to report photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'report-photos' 
    AND (storage.foldername(name))[1] IS NOT NULL
  );
