import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  deadline?: string;
  subtasks?: Task[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  activeProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
    },
    setActiveProject: (state, action: PayloadAction<Project | null>) => {
      state.activeProject = action.payload;
    },
    updateTask: (state, action: PayloadAction<{ projectId: string; taskId: string; updates: Partial<Task> }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const updateTaskInProject = (tasks: Task[]): Task[] => {
          return tasks.map(task => {
            if (task.id === action.payload.taskId) {
              return { ...task, ...action.payload.updates };
            }
            if (task.subtasks) {
              return { ...task, subtasks: updateTaskInProject(task.subtasks) };
            }
            return task;
          });
        };
        project.tasks = updateTaskInProject(project.tasks);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setActiveProject,
  updateTask,
  setLoading,
  setError,
} = projectSlice.actions;

export default projectSlice.reducer; 