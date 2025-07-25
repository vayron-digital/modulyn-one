-- Migration: 039_enhance_tasks_table.sql
-- Purpose: Enhance tasks table with time support, dependencies, and templates
-- Date: 2024-12-19

-- Add time support to due_date (make it TIMESTAMP WITH TIME ZONE)
ALTER TABLE tasks ALTER COLUMN due_date TYPE TIMESTAMP WITH TIME ZONE;

-- Add task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  child_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_task_id, child_task_id)
);

-- Add indexes for task dependencies
CREATE INDEX IF NOT EXISTS idx_task_dependencies_parent ON task_dependencies(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_child ON task_dependencies(child_task_id);

-- Enable RLS for task dependencies
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task dependencies
CREATE POLICY "Users can view task dependencies for their tasks"
  ON task_dependencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE (tasks.id = task_dependencies.parent_task_id OR tasks.id = task_dependencies.child_task_id)
      AND (tasks.created_by = auth.uid() OR tasks.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can insert task dependencies for their tasks"
  ON task_dependencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE (tasks.id = task_dependencies.parent_task_id OR tasks.id = task_dependencies.child_task_id)
      AND (tasks.created_by = auth.uid() OR tasks.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can delete task dependencies for their tasks"
  ON task_dependencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE (tasks.id = task_dependencies.parent_task_id OR tasks.id = task_dependencies.child_task_id)
      AND (tasks.created_by = auth.uid() OR tasks.assigned_to = auth.uid())
    )
  );

-- Add task templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'custom', -- 'custom', 'lead_followup', 'call_followup', etc.
  title_template TEXT NOT NULL,
  description_template TEXT,
  estimated_duration INTEGER, -- in minutes
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for task templates
CREATE INDEX IF NOT EXISTS idx_task_templates_type ON task_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_created_by ON task_templates(created_by);

-- Enable RLS for task templates
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task templates
CREATE POLICY "Users can view their own task templates"
  ON task_templates FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own task templates"
  ON task_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own task templates"
  ON task_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own task templates"
  ON task_templates FOR DELETE
  USING (created_by = auth.uid());

-- Add trigger to update updated_at timestamp for task templates
CREATE OR REPLACE FUNCTION update_task_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_task_templates_updated_at();

-- Insert some default task templates
INSERT INTO task_templates (name, description, template_type, title_template, description_template, estimated_duration, priority) VALUES
('Lead Follow-up', 'Follow up with a lead after initial contact', 'lead_followup', 'Follow-up with {{lead_name}}', 'Follow up on the initial conversation with {{lead_name}}. Check their interest level and schedule a meeting if needed.', 30, 'medium'),
('Call Follow-up', 'Follow up after a phone call', 'call_followup', 'Follow-up call with {{lead_name}}', 'Follow up on the call with {{lead_name}} on {{call_date}}. Send any promised materials and schedule next steps.', 15, 'medium'),
('Meeting Preparation', 'Prepare for a meeting with a lead', 'meeting_prep', 'Prepare for meeting with {{lead_name}}', 'Research {{lead_name}} and prepare presentation materials for the upcoming meeting.', 60, 'high'),
('Proposal Review', 'Review and send proposal', 'proposal', 'Review proposal for {{lead_name}}', 'Review the proposal for {{lead_name}} and make any necessary adjustments before sending.', 45, 'high'),
('Contract Follow-up', 'Follow up on contract status', 'contract', 'Follow up on contract with {{lead_name}}', 'Check the status of the contract with {{lead_name}} and address any concerns.', 30, 'medium'),
('Demo Preparation', 'Prepare for product demo', 'demo', 'Prepare demo for {{lead_name}}', 'Set up and prepare the product demo for {{lead_name}}. Test all features and prepare talking points.', 90, 'high'),
('Email Campaign', 'Send email campaign', 'email', 'Send email campaign to {{lead_name}}', 'Send the scheduled email campaign to {{lead_name}} and track engagement.', 20, 'low'),
('Social Media Follow-up', 'Follow up on social media interaction', 'social', 'Follow up on social media with {{lead_name}}', 'Follow up on the recent social media interaction with {{lead_name}}.', 15, 'low');

-- Grant permissions
GRANT ALL ON task_dependencies TO authenticated;
GRANT ALL ON task_templates TO authenticated; 