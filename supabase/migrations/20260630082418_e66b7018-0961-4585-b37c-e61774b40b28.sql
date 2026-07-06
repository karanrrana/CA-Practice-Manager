-- Storage RLS for documents bucket: active staff can read/upload; managers/admins delete
CREATE POLICY "staff read documents bucket" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_active_staff());
CREATE POLICY "staff upload documents bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_active_staff());
CREATE POLICY "mgr delete documents bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_manager_or_admin());