-- Image metadata for R2/S3 object storage (Neon-recommended pattern)
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_key TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'posts',
  content_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_images_folder_idx ON post_images (folder, created_at DESC);

ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS post_images_full_access ON post_images;
CREATE POLICY post_images_full_access ON post_images
  FOR ALL
  USING (true)
  WITH CHECK (true);
