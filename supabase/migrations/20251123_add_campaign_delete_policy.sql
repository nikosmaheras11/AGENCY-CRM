-- Add DELETE policy for campaigns
CREATE POLICY "Users can delete campaigns they created or are assigned to"
  ON campaigns FOR DELETE
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'account_manager')
    )
  );
