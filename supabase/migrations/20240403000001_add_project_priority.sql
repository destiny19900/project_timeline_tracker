-- Add priority column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS priority priority_level DEFAULT 'medium';

-- Update existing projects to have medium priority
UPDATE projects
SET priority = 'medium'
WHERE priority IS NULL; 