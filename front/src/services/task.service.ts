import { api } from './api.service';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';

export class TaskService {
  async getTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskDTO): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
}

export const taskService = new TaskService();

