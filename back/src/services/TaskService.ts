import { TaskRepository } from '../repositories/TaskRepository';
import { ITask, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async getAllTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  async getTaskById(id: string, userId: string): Promise<ITask | null> {
    return await this.taskRepository.findById(id, userId);
  }

  async createTask(userId: string, data: CreateTaskDTO): Promise<ITask> {
    return await this.taskRepository.create(userId, data);
  }

  async updateTask(id: string, userId: string, data: UpdateTaskDTO): Promise<ITask | null> {
    return await this.taskRepository.update(id, userId, data);
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    return await this.taskRepository.softDelete(id, userId);
  }
}

