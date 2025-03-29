export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  subtasks: Task[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
} 