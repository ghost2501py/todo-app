import { TaskService } from '../../services/TaskService';
import { TaskRepository } from '../../repositories/TaskRepository';
import { ITask, CreateTaskDTO, UpdateTaskDTO } from '../../types/task.types';

// Mock TaskRepository
jest.mock('../../repositories/TaskRepository');

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepository = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService();
    (taskService as any).taskRepository = mockTaskRepository;
  });

  describe('getAllTasks', () => {
    it('should return all tasks for a user', async () => {
      const userId = 'user123';
      const mockTasks: ITask[] = [
        {
          _id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          user_id: userId,
          created_at: new Date(),
          deleted_at: null
        },
        {
          _id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          user_id: userId,
          created_at: new Date(),
          deleted_at: null
        }
      ];

      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks(userId);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if user has no tasks', async () => {
      const userId = 'user123';
      mockTaskRepository.findByUserId.mockResolvedValue([]);

      const result = await taskService.getAllTasks(userId);

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate repository errors', async () => {
      const userId = 'user123';
      const error = new Error('Database connection failed');
      mockTaskRepository.findByUserId.mockRejectedValue(error);

      await expect(taskService.getAllTasks(userId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id for a specific user', async () => {
      const taskId = '1';
      const userId = 'user123';
      const mockTask: ITask = {
        _id: taskId,
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(taskId, userId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await taskService.getTaskById(taskId, userId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId, userId);
      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const taskId = '1';
      const userId = 'user123';
      const error = new Error('Database error');
      mockTaskRepository.findById.mockRejectedValue(error);

      await expect(taskService.getTaskById(taskId, userId)).rejects.toThrow('Database error');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const userId = 'user123';
      const taskData: CreateTaskDTO = {
        title: 'New Task',
        description: 'New Description'
      };

      const createdTask: ITask = {
        _id: '1',
        ...taskData,
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.create.mockResolvedValue(createdTask);

      const result = await taskService.createTask(userId, taskData);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(userId, taskData);
      expect(result).toEqual(createdTask);
      expect(result._id).toBe('1');
      expect(result.status).toBe('pending');
    });

    it('should create task with correct user association', async () => {
      const userId = 'user456';
      const taskData: CreateTaskDTO = {
        title: 'Task for user 456',
        description: 'Description'
      };

      const createdTask: ITask = {
        _id: '2',
        ...taskData,
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.create.mockResolvedValue(createdTask);

      const result = await taskService.createTask(userId, taskData);

      expect(mockTaskRepository.create).toHaveBeenCalledWith(userId, taskData);
      expect(result.user_id).toBe(userId);
    });

    it('should propagate repository errors', async () => {
      const userId = 'user123';
      const taskData: CreateTaskDTO = {
        title: 'Task',
        description: 'Description'
      };
      const error = new Error('Database error');
      mockTaskRepository.create.mockRejectedValue(error);

      await expect(taskService.createTask(userId, taskData)).rejects.toThrow('Database error');
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        title: 'Updated Task',
        status: 'completed'
      };

      const updatedTask: ITask = {
        _id: taskId,
        title: 'Updated Task',
        description: 'Original Description',
        status: 'completed',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, userId, updateData);
      expect(result).toEqual(updatedTask);
      expect(result?.title).toBe('Updated Task');
      expect(result?.status).toBe('completed');
    });

    it('should update only title', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        title: 'Only Title Updated'
      };

      const updatedTask: ITask = {
        _id: taskId,
        title: 'Only Title Updated',
        description: 'Original Description',
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, userId, updateData);
      expect(result?.title).toBe('Only Title Updated');
    });

    it('should update only status', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        status: 'completed'
      };

      const updatedTask: ITask = {
        _id: taskId,
        title: 'Original Title',
        description: 'Original Description',
        status: 'completed',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, userId, updateData);
      expect(result?.status).toBe('completed');
    });

    it('should return null if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        title: 'Updated'
      };

      mockTaskRepository.update.mockResolvedValue(null);

      const result = await taskService.updateTask(taskId, userId, updateData);

      expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, userId, updateData);
      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = { title: 'Updated' };
      const error = new Error('Database error');
      mockTaskRepository.update.mockRejectedValue(error);

      await expect(taskService.updateTask(taskId, userId, updateData)).rejects.toThrow('Database error');
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const taskId = '1';
      const userId = 'user123';
      mockTaskRepository.softDelete.mockResolvedValue(true);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId, userId);
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';
      mockTaskRepository.softDelete.mockResolvedValue(false);

      const result = await taskService.deleteTask(taskId, userId);

      expect(mockTaskRepository.softDelete).toHaveBeenCalledWith(taskId, userId);
      expect(result).toBe(false);
    });

    it('should propagate repository errors', async () => {
      const taskId = '1';
      const userId = 'user123';
      const error = new Error('Database error');
      mockTaskRepository.softDelete.mockRejectedValue(error);

      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow('Database error');
    });
  });
});

