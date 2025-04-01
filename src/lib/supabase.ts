import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a regular client for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          project_id: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
          parent_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          project_id: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
          parent_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          project_id?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
          parent_id?: string;
        };
      };
    };
  };
}; 