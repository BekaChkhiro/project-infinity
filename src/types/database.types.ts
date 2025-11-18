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
    };
  };
}

// Helper types for common queries
export type User = Database['public']['Tables']['users']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type StageHistory = Database['public']['Tables']['stage_history']['Row'];
export type SavedFilter = Database['public']['Tables']['saved_filters']['Row'];

export type NewUser = Database['public']['Tables']['users']['Insert'];
export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];
export type NewStageHistory = Database['public']['Tables']['stage_history']['Insert'];
export type NewSavedFilter = Database['public']['Tables']['saved_filters']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type UpdateProject = Database['public']['Tables']['projects']['Update'];
export type UpdateStageHistory = Database['public']['Tables']['stage_history']['Update'];
export type UpdateSavedFilter = Database['public']['Tables']['saved_filters']['Update'];

// View types
export type ClientStatistics = Database['public']['Views']['client_statistics']['Row'];
export type ClientPaymentAnalytics = Database['public']['Views']['client_payment_analytics']['Row'];

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
