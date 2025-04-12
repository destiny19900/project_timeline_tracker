import { supabase } from '../lib/supabase';
import type { Project, Task } from '../types';


export class ProjectService {
  private mapTaskRow(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      startDate: row.start_date,
      endDate: row.end_date,
      orderIndex: row.order_index,
      parentId: row.parent_id,
      completed: row.completed,
      projectId: row.project_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subtasks: [], // Initialize empty subtasks array
    };
  }

  private mapProjectRow(row: any): Project {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      startDate: row.start_date,
      endDate: row.end_date,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tasks: (row.tasks || []).map((task: any) => this.mapTaskRow(task)),
    };
  }

  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks:tasks!project_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data.map((row) => this.mapProjectRow(row));
  }

  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks:tasks!project_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Project not found');
    }

    return this.mapProjectRow(data);
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      console.log('Creating project with data:', projectData);

      // Start a transaction
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          user_id: projectData.userId,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      console.log('Project created:', project);

      // If there are tasks, insert them
      if (projectData.tasks && projectData.tasks.length > 0) {
        const tasksToInsert = projectData.tasks.map(task => ({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigned_user_id: task.assignedTo,
          start_date: task.startDate,
          end_date: task.endDate,
          order_index: task.orderIndex,
          parent_id: task.parentId,
          completed: task.completed,
          project_id: project.id,
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert);

        if (tasksError) throw tasksError;
      }

      // Fetch the complete project with tasks
      const { data: completeProject, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          tasks:tasks!project_id(*)
        `)
        .eq('id', project.id)
        .single();

      if (fetchError) throw fetchError;

      console.log('Complete project fetched:', completeProject);
      return this.mapProjectRow(completeProject);
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  async updateProject(project: Project): Promise<Project> {
    console.log('ProjectService.updateProject called with:', {
      id: project.id,
      title: project.title,
      status: project.status,
      priority: project.priority
    });
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    if (!data) throw new Error('Failed to update project');

    console.log('Project updated in database, received:', data);
    
    // We need to preserve the tasks since they're not returned in the update operation
    const tasksFromProject = project.tasks || [];
    const mappedProject = this.mapProjectRow(data);
    return {
      ...mappedProject,
      tasks: tasksFromProject
    };
  }

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        project_id: task.projectId,
        completed: task.completed,
        parent_id: task.parentId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create task');

    return this.mapTaskRow(data);
  }

  async updateTask(task: Task): Promise<Task> {
    console.log('ProjectService.updateTask called with:', {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      completed: task.completed
    });
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        completed: task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    if (!data) throw new Error('Failed to update task');

    console.log('Task updated in database, received:', data);
    return this.mapTaskRow(data);
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }
}

// Create and export an instance of ProjectService
export const projectService = new ProjectService(); 