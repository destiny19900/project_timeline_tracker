-- Create table for AI project generation usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add indexes for performance
  CONSTRAINT ai_usage_user_id_idx UNIQUE (id, user_id)
);

-- Add index for efficient weekly usage queries
CREATE INDEX IF NOT EXISTS ai_usage_user_created_idx ON ai_usage (user_id, created_at);

-- Add RLS policies for security
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage
CREATE POLICY "Users can view their own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);
  
-- Users can only insert their own usage
CREATE POLICY "Users can insert their own AI usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
-- Users cannot update or delete usage records
CREATE POLICY "Users cannot update AI usage" ON ai_usage
  FOR UPDATE USING (false);
  
CREATE POLICY "Users cannot delete AI usage" ON ai_usage
  FOR DELETE USING (false);

-- Allow service roles (for background jobs) to manage all records
CREATE POLICY "Service role can manage all AI usage" ON ai_usage
  USING (auth.role() = 'service_role'); 