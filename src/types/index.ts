export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedTo: string;
  projectId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  subtasks: any[]; // We can define a proper subtask interface later if needed
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'On Track' | 'Almost Done' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  progress: number;
  team: {
    name: string;
    avatar: string;
  }[];
  tasks: Task[];
} 