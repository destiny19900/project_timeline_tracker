import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import type { Project, Task } from '../types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

class ProjectService {
  async getProjects(userId: string): Promise<Project[]> {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;

    const projectPromises = projects.map(async (project) => {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      return this.mapProjectWithTasks(project, tasks);
    });

    return Promise.all(projectPromises);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: project.title,
        description: project.description,
        user_id: project.userId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create project');

    return this.mapProjectRow(data);
  }

  async updateProject(project: Project): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        description: project.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update project');

    return this.mapProjectRow(data);
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
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        completed: task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update task');

    return this.mapTaskRow(data);
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  private mapProjectRow(row: ProjectRow): Project {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      userId: row.user_id,
      createdAt: row.created_at,
      tasks: [],
    };
  }

  private mapTaskRow(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      projectId: row.project_id,
      completed: row.completed,
      createdAt: row.created_at,
      parentId: row.parent_id,
      subtasks: [],
    };
  }

  private mapProjectWithTasks(project: ProjectRow, tasks: TaskRow[]): Project {
    const mappedProject = this.mapProjectRow(project);
    const taskMap = new Map<string, Task>();

    // First pass: create all tasks
    tasks.forEach((task) => {
      taskMap.set(task.id, this.mapTaskRow(task));
    });

    // Second pass: build task hierarchy
    tasks.forEach((task) => {
      const mappedTask = taskMap.get(task.id)!;
      if (task.parent_id) {
        const parentTask = taskMap.get(task.parent_id);
        if (parentTask) {
          parentTask.subtasks.push(mappedTask);
        }
      } else {
        mappedProject.tasks.push(mappedTask);
      }
    });

    return mappedProject;
  }
}

export default new ProjectService(); 