export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  startDate: string | null;
  endDate: string | null;
  orderIndex: number;
  parentId: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  subtasks: Task[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  userId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  created_at?: string; // For Supabase compatibility
}

export interface DashboardData {
  activeTasks: number;
  completedTasks: number;
  totalProjects: number;
  recentProjects: Project[];
  taskDistribution: { name: string; value: number; color: string; }[];
  recentTasks: Task[];
} 