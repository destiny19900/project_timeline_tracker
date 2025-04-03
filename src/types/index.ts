export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string | null;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
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
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
} 