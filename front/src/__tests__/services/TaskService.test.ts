import { Task, CreateTaskDTO, UpdateTaskDTO } from '../../types/task.types';

// Mock the api service before importing
jest.mock('../../services/api.service');

import { TaskService } from '../../services/task.service';
import { api } from '../../services/api.service';

describe('TaskService', () => {
  let taskService: TaskService;
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch all tasks', async () => {
      const mockTasks: Task[] = [
        {
          _id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-01',
          deleted_at: null
        },
        {
          _id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          user_id: 'user123',
          created_at: '2024-01-02',
          deleted_at: null
        }
      ];

      mockApi.get.mockResolvedValue({ data: mockTasks });

      const result = await taskService.getTasks();

      expect(mockApi.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no tasks', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await taskService.getTasks();

      expect(mockApi.get).toHaveBeenCalledWith('/tasks');
      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      const error = new Error('Network error');
      mockApi.get.mockRejectedValue(error);

      await expect(taskService.getTasks()).rejects.toThrow('Network error');
      expect(mockApi.get).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('getTaskById', () => {
    it('should fetch task by id', async () => {
      const mockTask: Task = {
        _id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.get.mockResolvedValue({ data: mockTask });

      const result = await taskService.getTaskById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/tasks/1');
      expect(result).toEqual(mockTask);
      expect(result._id).toBe('1');
    });

    it('should handle different task ids', async () => {
      const mockTask: Task = {
        _id: '999',
        title: 'Task 999',
        description: 'Description',
        status: 'completed',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.get.mockResolvedValue({ data: mockTask });

      const result = await taskService.getTaskById('999');

      expect(mockApi.get).toHaveBeenCalledWith('/tasks/999');
      expect(result._id).toBe('999');
    });

    it('should propagate API errors', async () => {
      const error = new Error('Task not found');
      mockApi.get.mockRejectedValue(error);

      await expect(taskService.getTaskById('1')).rejects.toThrow('Task not found');
      expect(mockApi.get).toHaveBeenCalledWith('/tasks/1');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData: CreateTaskDTO = {
        title: 'New Task',
        description: 'New Description'
      };

      const createdTask: Task = {
        _id: '3',
        ...taskData,
        status: 'pending',
        user_id: 'user123',
        created_at: '2024-01-03',
        deleted_at: null
      };

      mockApi.post.mockResolvedValue({ data: createdTask });

      const result = await taskService.createTask(taskData);

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(result).toEqual(createdTask);
      expect(result.title).toBe('New Task');
      expect(result.status).toBe('pending');
    });

    it('should send correct task data', async () => {
      const taskData: CreateTaskDTO = {
        title: 'Another Task',
        description: 'Another Description'
      };

      const createdTask: Task = {
        _id: '4',
        ...taskData,
        status: 'pending',
        user_id: 'user123',
        created_at: '2024-01-04',
        deleted_at: null
      };

      mockApi.post.mockResolvedValue({ data: createdTask });

      await taskService.createTask(taskData);

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', {
        title: 'Another Task',
        description: 'Another Description'
      });
    });

    it('should propagate API errors', async () => {
      const taskData: CreateTaskDTO = {
        title: 'Task',
        description: 'Description'
      };

      const error = new Error('Validation failed');
      mockApi.post.mockRejectedValue(error);

      await expect(taskService.createTask(taskData)).rejects.toThrow('Validation failed');
      expect(mockApi.post).toHaveBeenCalledWith('/tasks', taskData);
    });
  });

  describe('updateTask', () => {
    it('should update task with all fields', async () => {
      const updateData: UpdateTaskDTO = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed'
      };

      const updatedTask: Task = {
        _id: '1',
        ...updateData,
        status: 'completed',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.put.mockResolvedValue({ data: updatedTask });

      const result = await taskService.updateTask('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', updateData);
      expect(result).toEqual(updatedTask);
      expect(result.title).toBe('Updated Task');
      expect(result.status).toBe('completed');
    });

    it('should update task with partial data', async () => {
      const updateData: UpdateTaskDTO = {
        status: 'completed'
      };

      const updatedTask: Task = {
        _id: '1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'completed',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.put.mockResolvedValue({ data: updatedTask });

      const result = await taskService.updateTask('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('should update only title', async () => {
      const updateData: UpdateTaskDTO = {
        title: 'Only Title Updated'
      };

      const updatedTask: Task = {
        _id: '1',
        title: 'Only Title Updated',
        description: 'Original Description',
        status: 'pending',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.put.mockResolvedValue({ data: updatedTask });

      const result = await taskService.updateTask('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', { title: 'Only Title Updated' });
      expect(result.title).toBe('Only Title Updated');
    });

    it('should handle different task ids', async () => {
      const updateData: UpdateTaskDTO = {
        status: 'completed'
      };

      const updatedTask: Task = {
        _id: '999',
        title: 'Task 999',
        description: 'Description',
        status: 'completed',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockApi.put.mockResolvedValue({ data: updatedTask });

      await taskService.updateTask('999', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/tasks/999', updateData);
    });

    it('should propagate API errors', async () => {
      const updateData: UpdateTaskDTO = {
        title: 'Updated'
      };

      const error = new Error('Task not found');
      mockApi.put.mockRejectedValue(error);

      await expect(taskService.updateTask('1', updateData)).rejects.toThrow('Task not found');
      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', updateData);
    });
  });

  describe('deleteTask', () => {
    it('should delete task by id', async () => {
      mockApi.delete.mockResolvedValue({});

      await taskService.deleteTask('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle different task ids', async () => {
      mockApi.delete.mockResolvedValue({});

      await taskService.deleteTask('999');

      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/999');
    });

    it('should not return data', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await taskService.deleteTask('1');

      expect(result).toBeUndefined();
    });

    it('should propagate API errors', async () => {
      const error = new Error('Task not found');
      mockApi.delete.mockRejectedValue(error);

      await expect(taskService.deleteTask('1')).rejects.toThrow('Task not found');
      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockApi.delete.mockRejectedValue(error);

      await expect(taskService.deleteTask('1')).rejects.toThrow('Network error');
    });
  });
});

