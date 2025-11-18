export type ProjectStage =
  | 'დასაწყები'
  | 'მოხდა პირველი კავშირი'
  | 'ჩავნიშნეთ შეხვედრა'
  | 'შევხვდით და ველოდებით ინფორმაციას'
  | 'მივიღეთ ინფორმაცია'
  | 'დავიწყეთ დეველოპემნტი'
  | 'დავიწყეთ ტესტირება'
  | 'გადავაგზავნეთ კლიენტთან'
  | 'ველოდებით კლიენტისგან უკუკავშირს'
  | 'დავიწყეთ კლიენტის ჩასწორებებზე მუშაობა'
  | 'გავუგზავნეთ კლიენტს საბოლოო ვერსია'
  | 'ველოდებით კლიენტის დასტურს'
  | 'კლიენტმა დაგვიდასტურა'
  | 'კლიენტს გავუგზავნეთ პროექტის გადახდის დეტალები'
  | 'კლიენტისგან ველოდებით ჩარიცხვას'
  | 'კლიენტმა ჩარიცხა'
  | 'ვამატებთ პორტფოლიო პროექტებში'
  | 'პროექტი დასრულებულია';

export type UserRole = 'admin' | 'user';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          address: string | null;
          notes: string | null;
          preferred_communication_method: 'email' | 'phone' | 'whatsapp' | 'telegram' | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          notes?: string | null;
          preferred_communication_method?: 'email' | 'phone' | 'whatsapp' | 'telegram' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          address?: string | null;
          notes?: string | null;
          preferred_communication_method?: 'email' | 'phone' | 'whatsapp' | 'telegram' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          client_id: string | null;
          current_stage: ProjectStage;
          stage_number: number;
          budget: number | null;
          paid_amount: number;
          start_date: string | null;
          deadline: string | null;
          completion_date: string | null;
          notes: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          client_id?: string | null;
          current_stage?: ProjectStage;
          stage_number?: number;
          budget?: number | null;
          paid_amount?: number;
          start_date?: string | null;
          deadline?: string | null;
          completion_date?: string | null;
          notes?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          client_id?: string | null;
          current_stage?: ProjectStage;
          stage_number?: number;
          budget?: number | null;
          paid_amount?: number;
          start_date?: string | null;
          deadline?: string | null;
          completion_date?: string | null;
          notes?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stage_history: {
        Row: {
          id: string;
          project_id: string;
          from_stage: ProjectStage | null;
          to_stage: ProjectStage;
          from_stage_number: number | null;
          to_stage_number: number;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          from_stage?: ProjectStage | null;
          to_stage: ProjectStage;
          from_stage_number?: number | null;
          to_stage_number: number;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          from_stage?: ProjectStage | null;
          to_stage?: ProjectStage;
          from_stage_number?: number | null;
          to_stage_number?: number;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      saved_filters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filter_type: 'projects' | 'clients' | 'both';
          filters: Record<string, any>;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filter_type: 'projects' | 'clients' | 'both';
          filters: Record<string, any>;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          filter_type?: 'projects' | 'clients' | 'both';
          filters?: Record<string, any>;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'stage_change' | 'project_stuck' | 'payment_received' | 'project_created' | 'approval_received' | 'deadline_approaching' | 'automation_triggered' | 'system_alert';
          title: string;
          message: string;
          metadata: Record<string, any>;
          related_project_id: string | null;
          related_client_id: string | null;
          is_read: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'stage_change' | 'project_stuck' | 'payment_received' | 'project_created' | 'approval_received' | 'deadline_approaching' | 'automation_triggered' | 'system_alert';
          title: string;
          message: string;
          metadata?: Record<string, any>;
          related_project_id?: string | null;
          related_client_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'stage_change' | 'project_stuck' | 'payment_received' | 'project_created' | 'approval_received' | 'deadline_approaching' | 'automation_triggered' | 'system_alert';
          title?: string;
          message?: string;
          metadata?: Record<string, any>;
          related_project_id?: string | null;
          related_client_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          subject: string;
          body: string;
          stage_number: number | null;
          variables: string[];
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          subject: string;
          body: string;
          stage_number?: number | null;
          variables?: string[];
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          subject?: string;
          body?: string;
          stage_number?: number | null;
          variables?: string[];
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          trigger_type: 'stage_enter' | 'stage_duration' | 'time_scheduled' | 'project_created' | 'payment_received' | 'condition_met';
          trigger_config: Record<string, any>;
          action_type: 'send_notification' | 'send_email' | 'create_task' | 'assign_team' | 'move_stage' | 'flag_project' | 'generate_invoice' | 'create_reminder';
          action_config: Record<string, any>;
          is_active: boolean;
          dry_run: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          last_triggered_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          trigger_type: 'stage_enter' | 'stage_duration' | 'time_scheduled' | 'project_created' | 'payment_received' | 'condition_met';
          trigger_config?: Record<string, any>;
          action_type: 'send_notification' | 'send_email' | 'create_task' | 'assign_team' | 'move_stage' | 'flag_project' | 'generate_invoice' | 'create_reminder';
          action_config?: Record<string, any>;
          is_active?: boolean;
          dry_run?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_triggered_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: 'stage_enter' | 'stage_duration' | 'time_scheduled' | 'project_created' | 'payment_received' | 'condition_met';
          trigger_config?: Record<string, any>;
          action_type?: 'send_notification' | 'send_email' | 'create_task' | 'assign_team' | 'move_stage' | 'flag_project' | 'generate_invoice' | 'create_reminder';
          action_config?: Record<string, any>;
          is_active?: boolean;
          dry_run?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          last_triggered_at?: string | null;
        };
      };
      automation_executions: {
        Row: {
          id: string;
          rule_id: string | null;
          project_id: string | null;
          status: 'success' | 'failed' | 'skipped';
          dry_run: boolean;
          execution_details: Record<string, any>;
          error_message: string | null;
          executed_at: string;
        };
        Insert: {
          id?: string;
          rule_id?: string | null;
          project_id?: string | null;
          status: 'success' | 'failed' | 'skipped';
          dry_run?: boolean;
          execution_details?: Record<string, any>;
          error_message?: string | null;
          executed_at?: string;
        };
        Update: {
          id?: string;
          rule_id?: string | null;
          project_id?: string | null;
          status?: 'success' | 'failed' | 'skipped';
          dry_run?: boolean;
          execution_details?: Record<string, any>;
          error_message?: string | null;
          executed_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: 'project_created' | 'project_updated' | 'project_deleted' | 'stage_changed' | 'client_created' | 'client_updated' | 'client_deleted' | 'payment_recorded' | 'file_uploaded' | 'automation_triggered' | 'settings_changed' | 'user_login' | 'user_logout';
          entity_type: 'project' | 'client' | 'user' | 'automation' | 'system';
          entity_id: string | null;
          old_values: Record<string, any> | null;
          new_values: Record<string, any> | null;
          metadata: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: 'project_created' | 'project_updated' | 'project_deleted' | 'stage_changed' | 'client_created' | 'client_updated' | 'client_deleted' | 'payment_recorded' | 'file_uploaded' | 'automation_triggered' | 'settings_changed' | 'user_login' | 'user_logout';
          entity_type: 'project' | 'client' | 'user' | 'automation' | 'system';
          entity_id?: string | null;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action_type?: 'project_created' | 'project_updated' | 'project_deleted' | 'stage_changed' | 'client_created' | 'client_updated' | 'client_deleted' | 'payment_recorded' | 'file_uploaded' | 'automation_triggered' | 'settings_changed' | 'user_login' | 'user_logout';
          entity_type?: 'project' | 'client' | 'user' | 'automation' | 'system';
          entity_id?: string | null;
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          metadata?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          notifications_enabled: boolean;
          email_notifications: boolean;
          automation_enabled: boolean;
          notification_types: Record<string, boolean>;
          stuck_project_threshold_days: number;
          alert_preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          automation_enabled?: boolean;
          notification_types?: Record<string, boolean>;
          stuck_project_threshold_days?: number;
          alert_preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          notifications_enabled?: boolean;
          email_notifications?: boolean;
          automation_enabled?: boolean;
          notification_types?: Record<string, boolean>;
          stuck_project_threshold_days?: number;
          alert_preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_alerts: {
        Row: {
          id: string;
          project_id: string;
          alert_type: 'stuck_in_stage' | 'payment_delay' | 'deadline_approaching' | 'high_value' | 'multiple_projects_same_client' | 'custom';
          severity: 'low' | 'medium' | 'high' | 'critical';
          message: string;
          metadata: Record<string, any>;
          is_resolved: boolean;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          alert_type: 'stuck_in_stage' | 'payment_delay' | 'deadline_approaching' | 'high_value' | 'multiple_projects_same_client' | 'custom';
          severity: 'low' | 'medium' | 'high' | 'critical';
          message: string;
          metadata?: Record<string, any>;
          is_resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          alert_type?: 'stuck_in_stage' | 'payment_delay' | 'deadline_approaching' | 'high_value' | 'multiple_projects_same_client' | 'custom';
          severity?: 'low' | 'medium' | 'high' | 'critical';
          message?: string;
          metadata?: Record<string, any>;
          is_resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      client_statistics: {
        Row: {
          id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          preferred_communication_method: 'email' | 'phone' | 'whatsapp' | 'telegram' | null;
          total_projects: number;
          active_projects: number;
          last_project_date: string | null;
          total_revenue: number;
          total_paid: number;
          created_at: string;
          updated_at: string;
        };
      };
      client_payment_analytics: {
        Row: {
          client_id: string;
          client_name: string;
          total_projects: number;
          completed_projects: number;
          projects_in_payment: number;
          total_budget: number;
          total_paid: number;
          payment_punctuality_score: number;
          avg_project_duration_days: number | null;
        };
      };
      automation_dashboard: {
        Row: {
          unread_notifications: number;
          active_alerts: number;
          active_rules: number;
          stuck_projects: number;
          automations_today: number;
        };
      };
      projects_requiring_action: {
        Row: {
          id: string;
          title: string;
          current_stage: ProjectStage;
          stage_number: number;
          client_name: string | null;
          days_in_current_stage: number;
          priority: 'low' | 'medium' | 'high' | 'critical';
          active_alerts_count: number;
        };
      };
    };
  };
}

// Helper types for common queries
export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type StageHistory = Database['public']['Tables']['stage_history']['Row'];
export type SavedFilter = Database['public']['Tables']['saved_filters']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
export type AutomationRule = Database['public']['Tables']['automation_rules']['Row'];
export type AutomationExecution = Database['public']['Tables']['automation_executions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
export type ProjectAlert = Database['public']['Tables']['project_alerts']['Row'];

export type NewUser = Database['public']['Tables']['users']['Insert'];
export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];
export type NewStageHistory = Database['public']['Tables']['stage_history']['Insert'];
export type NewSavedFilter = Database['public']['Tables']['saved_filters']['Insert'];
export type NewNotification = Database['public']['Tables']['notifications']['Insert'];
export type NewEmailTemplate = Database['public']['Tables']['email_templates']['Insert'];
export type NewAutomationRule = Database['public']['Tables']['automation_rules']['Insert'];
export type NewAutomationExecution = Database['public']['Tables']['automation_executions']['Insert'];
export type NewAuditLog = Database['public']['Tables']['audit_logs']['Insert'];
export type NewUserPreferences = Database['public']['Tables']['user_preferences']['Insert'];
export type NewProjectAlert = Database['public']['Tables']['project_alerts']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type UpdateProject = Database['public']['Tables']['projects']['Update'];
export type UpdateStageHistory = Database['public']['Tables']['stage_history']['Update'];
export type UpdateSavedFilter = Database['public']['Tables']['saved_filters']['Update'];
export type UpdateNotification = Database['public']['Tables']['notifications']['Update'];
export type UpdateEmailTemplate = Database['public']['Tables']['email_templates']['Update'];
export type UpdateAutomationRule = Database['public']['Tables']['automation_rules']['Update'];
export type UpdateAutomationExecution = Database['public']['Tables']['automation_executions']['Update'];
export type UpdateAuditLog = Database['public']['Tables']['audit_logs']['Update'];
export type UpdateUserPreferences = Database['public']['Tables']['user_preferences']['Update'];
export type UpdateProjectAlert = Database['public']['Tables']['project_alerts']['Update'];

// View types
export type ClientStatistics = Database['public']['Views']['client_statistics']['Row'];
export type ClientPaymentAnalytics = Database['public']['Views']['client_payment_analytics']['Row'];
export type AutomationDashboard = Database['public']['Views']['automation_dashboard']['Row'];
export type ProjectRequiringAction = Database['public']['Views']['projects_requiring_action']['Row'];

// Extended types with relations
export type ClientWithStats = Client & {
  total_projects?: number;
  active_projects?: number;
  last_project_date?: string | null;
  total_revenue?: number;
  total_paid?: number;
};

export type ProjectWithClient = Project & {
  client?: Client;
};

export type NotificationWithRelations = Notification & {
  project?: Project;
  client?: Client;
};

export type AutomationRuleWithExecutions = AutomationRule & {
  executions?: AutomationExecution[];
  last_execution?: AutomationExecution;
};

export type ProjectAlertWithProject = ProjectAlert & {
  project?: Project;
};

export type AuditLogWithUser = AuditLog & {
  user?: User;
};
