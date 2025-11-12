import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks(req.userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
    }
  };

  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id, req.userId);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch task', message: error.message });
    }
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskData: CreateTaskDTO = req.body;
      const task = await this.taskService.createTask(req.userId, taskData);

      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create task', message: error.message });
    }
  };

  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateTaskDTO = req.body;
      const task = await this.taskService.updateTask(id, req.userId, updateData);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update task', message: error.message });
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.taskService.deleteTask(id, req.userId);

      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete task', message: error.message });
    }
  };
}

