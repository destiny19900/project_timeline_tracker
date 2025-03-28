import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setActiveProject,
  updateTask,
  setLoading,
  setError,
  Project,
  Task,
} from '../store/slices/projectSlice';

export const useProjects = () => {
  const dispatch = useDispatch();
  const { projects, activeProject, loading, error } = useSelector(
    (state: RootState) => state.projects
  );

  const fetchProjects = async () => {
    try {
      dispatch(setLoading(true));
      // TODO: Implement API call to fetch projects
      // const response = await api.getProjects();
      // dispatch(setProjects(response.data));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch projects'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch(setLoading(true));
      // TODO: Implement API call to create project
      // const response = await api.createProject(project);
      // dispatch(addProject(response.data));
      // return response.data;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to create project'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProjectDetails = async (project: Project) => {
    try {
      dispatch(setLoading(true));
      // TODO: Implement API call to update project
      // const response = await api.updateProject(project);
      dispatch(updateProject(project));
      // return response.data;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to update project'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const removeProject = async (projectId: string) => {
    try {
      dispatch(setLoading(true));
      // TODO: Implement API call to delete project
      // await api.deleteProject(projectId);
      dispatch(deleteProject(projectId));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to delete project'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const selectProject = (project: Project | null) => {
    dispatch(setActiveProject(project));
  };

  const updateTaskStatus = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      dispatch(setLoading(true));
      // TODO: Implement API call to update task
      // const response = await api.updateTask(projectId, taskId, updates);
      dispatch(updateTask({ projectId, taskId, updates }));
      // return response.data;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to update task'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    projects,
    activeProject,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProjectDetails,
    removeProject,
    selectProject,
    updateTaskStatus,
  };
}; 