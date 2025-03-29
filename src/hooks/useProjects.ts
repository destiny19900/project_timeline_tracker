import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setLoading,
  setError,
} from '../store/slices/projectSlice';
import projectService from '../services/projectService';
import type { Project, Task } from '../types';

export const useProjects = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectService.getProjects(user!.id);
      dispatch(setProjects(projects));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newProject = await projectService.createProject(project);
      dispatch(addProject(newProject));
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  };

  const updateProjectDetails = async (project: Project) => {
    try {
      setError(null);
      const updatedProject = await projectService.updateProject(project);
      dispatch(updateProject(updatedProject));
      if (activeProject?.id === project.id) {
        setActiveProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  const removeProject = async (projectId: string) => {
    try {
      setError(null);
      await projectService.deleteProject(projectId);
      dispatch(deleteProject(projectId));
      if (activeProject?.id === projectId) {
        setActiveProject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  };

  const updateTaskStatus = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const project = projects.find((p: Project) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const findAndUpdateTask = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates };
          }
          if (task.subtasks) {
            return { ...task, subtasks: findAndUpdateTask(task.subtasks) };
          }
          return task;
        });
      };

      const updatedTasks = findAndUpdateTask(project.tasks);
      const updatedProject = { ...project, tasks: updatedTasks };
      await updateProjectDetails(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const toggleTaskCompletion = async (projectId: string, taskId: string) => {
    try {
      setError(null);
      const project = projects.find((p: Project) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const findAndUpdateTask = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, completed: !task.completed };
          }
          if (task.subtasks) {
            return { ...task, subtasks: findAndUpdateTask(task.subtasks) };
          }
          return task;
        });
      };

      const updatedTasks = findAndUpdateTask(project.tasks);
      const updatedProject = { ...project, tasks: updatedTasks };
      await updateProjectDetails(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task completion');
      throw err;
    }
  };

  const selectProject = (project: Project | null) => {
    setActiveProject(project);
  };

  return {
    projects,
    activeProject,
    loading,
    error,
    createProject,
    updateProject: updateProjectDetails,
    deleteProject: removeProject,
    toggleTaskCompletion,
    refreshProjects: loadProjects,
    updateTaskStatus,
    selectProject,
  };
}; 