-- Run in Supabase Dashboard SQL editor
-- Creates the storage bucket for design image assets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('design-assets', 'design-assets', true, 5242880, '{image/jpeg,image/png,image/webp,image/gif}')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to design-assets
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'design-assets');

-- Allow public read access to design-assets
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'design-assets');

-- Allow owners to delete their uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'design-assets' AND owner_id = auth.uid());
