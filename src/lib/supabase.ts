import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a regular client for all operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to fetch all users
export const getAllUsers = async () => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return users;
};

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
          status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
          priority: 'low' | 'medium' | 'high';
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          user_id: string;
          status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
          priority?: 'low' | 'medium' | 'high';
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          user_id?: string;
          status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
          priority?: 'low' | 'medium' | 'high';
          start_date?: string | null;
          end_date?: string | null;
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