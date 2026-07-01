-- Allow friends to SELECT each other's poop_logs (for friend feed)
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "Friends can view each other's logs" ON poop_logs;
CREATE POLICY "Friends can view each other's logs" ON poop_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = user_id)
          OR (addressee_id = auth.uid() AND requester_id = user_id)
        )
    )
  );
