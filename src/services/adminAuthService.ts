import { supabase } from '../lib/supabase';

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  created_at: string;
}

class AdminAuthService {
  async login(credentials: AdminCredentials): Promise<AdminUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned');

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;
    if (!userData || userData.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return userData;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    if (!data || data.role !== 'admin') return null;

    return data;
  }
}

export const adminAuthService = new AdminAuthService(); 