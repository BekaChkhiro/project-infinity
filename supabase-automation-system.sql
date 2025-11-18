-- Automation and Notification System Migration
-- Run this migration after the client enhancements migration

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'stage_change',
    'project_stuck',
    'payment_received',
    'project_created',
    'approval_received',
    'deadline_approaching',
    'automation_triggered',
    'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  related_client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- EMAIL TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  stage_number INTEGER,
  variables TEXT[] DEFAULT ARRAY['client_name', 'project_name', 'stage', 'notes'],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_templates_stage ON email_templates(stage_number);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- ============================================================================
-- AUTOMATION RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'stage_enter',
    'stage_duration',
    'time_scheduled',
    'project_created',
    'payment_received',
    'condition_met'
  )),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'send_notification',
    'send_email',
    'create_task',
    'assign_team',
    'move_stage',
    'flag_project',
    'generate_invoice',
    'create_reminder'
  )),
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  dry_run BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_triggered_at TIMESTAMPTZ
);

CREATE INDEX idx_automation_rules_active ON automation_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);

-- ============================================================================
-- AUTOMATION RULE EXECUTIONS (Audit Trail for Automation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  dry_run BOOLEAN DEFAULT false,
  execution_details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_automation_executions_rule ON automation_executions(rule_id);
CREATE INDEX idx_automation_executions_project ON automation_executions(project_id);
CREATE INDEX idx_automation_executions_executed_at ON automation_executions(executed_at DESC);

-- ============================================================================
-- AUDIT LOGS TABLE (Enhanced Activity Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'project_created',
    'project_updated',
    'project_deleted',
    'stage_changed',
    'client_created',
    'client_updated',
    'client_deleted',
    'payment_recorded',
    'file_uploaded',
    'automation_triggered',
    'settings_changed',
    'user_login',
    'user_logout'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'client', 'user', 'automation', 'system')),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  automation_enabled BOOLEAN DEFAULT true,
  notification_types JSONB DEFAULT '{
    "stage_change": true,
    "project_stuck": true,
    "payment_received": true,
    "project_created": true,
    "approval_received": true,
    "deadline_approaching": true,
    "automation_triggered": false
  }'::jsonb,
  stuck_project_threshold_days INTEGER DEFAULT 7,
  alert_preferences JSONB DEFAULT '{
    "high_value_threshold": 10000,
    "weekend_alerts": false,
    "quiet_hours_start": null,
    "quiet_hours_end": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PROJECT ALERTS TABLE (Smart Alerts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'stuck_in_stage',
    'payment_delay',
    'deadline_approaching',
    'high_value',
    'multiple_projects_same_client',
    'custom'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_alerts_project ON project_alerts(project_id);
CREATE INDEX idx_project_alerts_unresolved ON project_alerts(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_project_alerts_severity ON project_alerts(severity);
CREATE INDEX idx_project_alerts_type ON project_alerts(alert_type);

-- ============================================================================
-- FUNCTIONS FOR AUTOMATION
-- ============================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_project_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    related_project_id,
    related_client_id
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_metadata,
    p_project_id,
    p_client_id
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    p_user_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_metadata
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to detect stuck projects
CREATE OR REPLACE FUNCTION detect_stuck_projects(threshold_days INTEGER DEFAULT 7)
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  current_stage TEXT,
  stage_number INTEGER,
  days_in_stage INTEGER,
  client_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.current_stage,
    p.stage_number,
    EXTRACT(DAY FROM (NOW() - p.updated_at))::INTEGER as days_in_stage,
    c.name as client_name
  FROM projects p
  LEFT JOIN clients c ON c.id = p.client_id
  WHERE
    p.stage_number < 18 -- Not completed
    AND EXTRACT(DAY FROM (NOW() - p.updated_at)) >= threshold_days
  ORDER BY days_in_stage DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND is_read = false;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ============================================================================

-- Trigger to create notification when stage changes
CREATE OR REPLACE FUNCTION notify_stage_change()
RETURNS TRIGGER AS $$
DECLARE
  v_project_record RECORD;
  v_user_id UUID;
BEGIN
  -- Get project details
  SELECT p.*, c.name as client_name
  INTO v_project_record
  FROM projects p
  LEFT JOIN clients c ON c.id = p.client_id
  WHERE p.id = NEW.project_id;

  -- Get the user who made the change
  v_user_id := NEW.changed_by;

  -- Create notification
  PERFORM create_notification(
    v_user_id,
    'stage_change',
    'პროექტი გადავიდა ახალ ეტაპზე',
    format('პროექტი "%s" გადავიდა ეტაპზე: %s', v_project_record.title, NEW.to_stage),
    jsonb_build_object(
      'from_stage', NEW.from_stage,
      'to_stage', NEW.to_stage,
      'project_id', NEW.project_id,
      'client_name', v_project_record.client_name
    ),
    NEW.project_id,
    v_project_record.client_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_stage_change
AFTER INSERT ON stage_history
FOR EACH ROW
EXECUTE FUNCTION notify_stage_change();

-- ============================================================================
-- DEFAULT EMAIL TEMPLATES
-- ============================================================================

INSERT INTO email_templates (name, description, subject, body, stage_number) VALUES
('შეხვედრის მოწვევა', 'Template for inviting client to planning meeting',
'შეხვედრის დაგეგმვა - {project_name}',
'გამარჯობა {client_name},

გვსურს დავგეგმოთ შეხვედრა პროექტ "{project_name}"-ის დეტალების განსახილველად.

გთხოვთ შეგვატყობინოთ თქვენთვის მოსახერხებელი დრო.

პატივისცემით,
თქვენი გუნდი', 3),

('გადახედვის ლინკი', 'Template for sending preview link to client',
'პროექტის გადახედვა - {project_name}',
'გამარჯობა {client_name},

თქვენი პროექტი "{project_name}" მზადაა გადასახედად.

შენიშვნები: {notes}

გთხოვთ გადახედოთ და გვაცნობოთ თქვენი აზრი.

პატივისცემით,
თქვენი გუნდი', 8),

('ინვოისი', 'Template for sending invoice',
'ინვოისი - {project_name}',
'გამარჯობა {client_name},

მიმაგრებულია ინვოისი პროექტისთვის "{project_name}".

სტატუსი: {stage}

გთხოვთ განახორციელოთ გადახდა მითითებულ ვადაში.

პატივისცემით,
თქვენი გუნდი', 14);

-- ============================================================================
-- DEFAULT AUTOMATION RULES
-- ============================================================================

INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, is_active) VALUES
('შეხვედრის შეხსენება', 'Create calendar reminder when project enters stage 3',
'stage_enter',
'{"stage_number": 3}'::jsonb,
'create_reminder',
'{"reminder_type": "meeting", "days_ahead": 1}'::jsonb,
true),

('7 დღიანი შეტყობინება', 'Notify if project stuck in any stage for 7 days',
'stage_duration',
'{"threshold_days": 7, "exclude_stages": [18]}'::jsonb,
'send_notification',
'{"title": "პროექტი გაჩერებულია", "message": "პროექტი 7 დღეზე მეტია იმავე ეტაპზე"}'::jsonb,
true),

('გადახდის შეტყობინება', 'Notify when payment is received (stage 16)',
'stage_enter',
'{"stage_number": 16}'::jsonb,
'send_notification',
'{"title": "გადახდა მიღებულია", "message": "პროექტის გადახდა წარმატებით მიღებულია"}'::jsonb,
true);

-- ============================================================================
-- VIEWS FOR AUTOMATION INSIGHTS
-- ============================================================================

CREATE OR REPLACE VIEW automation_dashboard AS
SELECT
  (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications,
  (SELECT COUNT(*) FROM project_alerts WHERE is_resolved = false) as active_alerts,
  (SELECT COUNT(*) FROM automation_rules WHERE is_active = true) as active_rules,
  (SELECT COUNT(*) FROM projects WHERE EXTRACT(DAY FROM (NOW() - updated_at)) >= 7 AND stage_number < 18) as stuck_projects,
  (SELECT COUNT(DISTINCT project_id) FROM automation_executions WHERE executed_at >= NOW() - INTERVAL '24 hours') as automations_today;

-- View for projects requiring action
CREATE OR REPLACE VIEW projects_requiring_action AS
SELECT
  p.id,
  p.title,
  p.current_stage,
  p.stage_number,
  c.name as client_name,
  EXTRACT(DAY FROM (NOW() - p.updated_at))::INTEGER as days_in_current_stage,
  CASE
    WHEN EXTRACT(DAY FROM (NOW() - p.updated_at)) >= 14 THEN 'critical'
    WHEN EXTRACT(DAY FROM (NOW() - p.updated_at)) >= 7 THEN 'high'
    WHEN EXTRACT(DAY FROM (NOW() - p.updated_at)) >= 3 THEN 'medium'
    ELSE 'low'
  END as priority,
  (SELECT COUNT(*) FROM project_alerts WHERE project_id = p.id AND is_resolved = false) as active_alerts_count
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.stage_number < 18
ORDER BY days_in_current_stage DESC;

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE email_templates IS 'Email templates for client communication';
COMMENT ON TABLE automation_rules IS 'Automation rules for workflow automation';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';
COMMENT ON TABLE user_preferences IS 'User preferences for notifications and automation';
COMMENT ON TABLE project_alerts IS 'Smart alerts for projects requiring attention';
