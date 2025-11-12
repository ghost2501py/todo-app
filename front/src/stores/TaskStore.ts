import { makeAutoObservable, runInAction } from 'mobx';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';
import { taskService } from '../services/task.service';

export class TaskStore {
  tasks: Task[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  messageId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
    if (error) {
      this.messageId++;
      setTimeout(() => {
        runInAction(() => {
          this.error = null;
        });
      }, 5000);
    }
  }

  setSuccess(success: string | null) {
    this.success = success;
    if (success) {
      this.messageId++;
      setTimeout(() => {
        runInAction(() => {
          this.success = null;
        });
      }, 3000);
    }
  }

  async fetchTasks() {
    this.setLoading(true);
    this.setError(null);

    try {
      const tasks = await taskService.getTasks();
      runInAction(() => {
        this.tasks = tasks;
      });
    } catch (error: any) {
      this.setError(error.response?.data?.error || 'Error al traer las tareas');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async createTask(data: CreateTaskDTO) {
    this.setLoading(true);
    this.setError(null);

    try {
      const task = await taskService.createTask(data);
      runInAction(() => {
        this.tasks.unshift(task);
        this.setSuccess('Tarea creada exitosamente');
      });
    } catch (error: any) {
      this.setError(error.response?.data?.error || 'Error al crear la tarea');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async updateTask(id: string, data: UpdateTaskDTO) {
    this.setLoading(true);
    this.setError(null);

    try {
      const updatedTask = await taskService.updateTask(id, data);
      runInAction(() => {
        const index = this.tasks.findIndex((task) => task._id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.setSuccess('Tarea actualizada exitosamente');
      });
    } catch (error: any) {
      this.setError(error.response?.data?.error || 'Error al actualizar la tarea');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async deleteTask(id: string) {
    this.setLoading(true);
    this.setError(null);

    try {
      await taskService.deleteTask(id);
      runInAction(() => {
        this.tasks = this.tasks.filter((task) => task._id !== id);
        this.setSuccess('Tarea borrada exitosamente');
      });
    } catch (error: any) {
      this.setError(error.response?.data?.error || 'Error al borrar la tarea');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  get pendingTasks() {
    return this.tasks.filter((task) => task.status === 'pending');
  }

  get completedTasks() {
    return this.tasks.filter((task) => task.status === 'completed');
  }
}

export const taskStore = new TaskStore();

