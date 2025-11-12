import { Request, Response } from 'express';
import { TaskController } from '../../controllers/TaskController';
import { TaskService } from '../../services/TaskService';
import { ITask } from '../../types/task.types';

// Mock TaskService
jest.mock('../../services/TaskService');

describe('TaskController', () => {
  let taskController: TaskController;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  let responseSend: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockTaskService = new TaskService() as jest.Mocked<TaskService>;
    taskController = new TaskController();
    (taskController as any).taskService = mockTaskService;

    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();
    responseSend = jest.fn().mockReturnThis();

    mockResponse = {
      json: responseJson,
      status: responseStatus,
      send: responseSend
    };

    mockRequest = {
      userId: 'user123',
      params: {},
      body: {}
    };
  });

  describe('getAllTasks', () => {
    it('should return all tasks for authenticated user', async () => {
      const mockTasks: ITask[] = [
        {
          _id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          user_id: 'user123',
          created_at: new Date(),
          deleted_at: null
        },
        {
          _id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'completed',
          user_id: 'user123',
          created_at: new Date(),
          deleted_at: null
        }
      ];

      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

      await taskController.getAllTasks(mockRequest as Request, mockResponse as Response);

      expect(mockTaskService.getAllTasks).toHaveBeenCalledWith('user123');
      expect(responseJson).toHaveBeenCalledWith(mockTasks);
    });

    it('should return 500 on service error', async () => {
      const error = new Error('Database error');
      mockTaskService.getAllTasks.mockRejectedValue(error);

      await taskController.getAllTasks(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Failed to fetch tasks',
        message: 'Database error'
      });
    });
  });

  describe('getTaskById', () => {
    it('should return task by id for authenticated user', async () => {
      const mockTask: ITask = {
        _id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        user_id: 'user123',
        created_at: new Date(),
        deleted_at: null
      };

      mockRequest.params = { id: '1' };
      mockTaskService.getTaskById.mockResolvedValue(mockTask);

      await taskController.getTaskById(mockRequest as Request, mockResponse as Response);

      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1', 'user123');
      expect(responseJson).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 if task not found', async () => {
      mockRequest.params = { id: '999' };
      mockTaskService.getTaskById.mockResolvedValue(null);

      await taskController.getTaskById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 500 on service error', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockTaskService.getTaskById.mockRejectedValue(error);

      await taskController.getTaskById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Failed to fetch task',
        message: 'Database error'
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task for authenticated user', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description'
      };

      const createdTask: ITask = {
        _id: '1',
        ...taskData,
        status: 'pending',
        user_id: 'user123',
        created_at: new Date(),
        deleted_at: null
      };

      mockRequest.body = taskData;
      mockTaskService.createTask.mockResolvedValue(createdTask);

      await taskController.createTask(mockRequest as Request, mockResponse as Response);

      expect(mockTaskService.createTask).toHaveBeenCalledWith('user123', taskData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdTask);
    });

    it('should return 500 on service error', async () => {
      mockRequest.body = { title: 'Task', description: 'Description' };
      const error = new Error('Database error');
      mockTaskService.createTask.mockRejectedValue(error);

      await taskController.createTask(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Failed to create task',
        message: 'Database error'
      });
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'completed' as const
      };

      const updatedTask: ITask = {
        _id: '1',
        title: 'Updated Task',
        description: 'Description',
        status: 'completed',
        user_id: 'user123',
        created_at: new Date(),
        deleted_at: null
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskController.updateTask(mockRequest as Request, mockResponse as Response);

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', 'user123', updateData);
      expect(responseJson).toHaveBeenCalledWith(updatedTask);
    });

    it('should return 404 if task not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'Updated' };
      mockTaskService.updateTask.mockResolvedValue(null);

      await taskController.updateTask(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 500 on service error', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated' };
      const error = new Error('Database error');
      mockTaskService.updateTask.mockRejectedValue(error);

      await taskController.updateTask(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Failed to update task',
        message: 'Database error'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      mockRequest.params = { id: '1' };
      mockTaskService.deleteTask.mockResolvedValue(true);

      await taskController.deleteTask(mockRequest as Request, mockResponse as Response);

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1', 'user123');
      expect(responseStatus).toHaveBeenCalledWith(204);
      expect(responseSend).toHaveBeenCalled();
    });

    it('should return 404 if task not found', async () => {
      mockRequest.params = { id: '999' };
      mockTaskService.deleteTask.mockResolvedValue(false);

      await taskController.deleteTask(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 500 on service error', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockTaskService.deleteTask.mockRejectedValue(error);

      await taskController.deleteTask(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Failed to delete task',
        message: 'Database error'
      });
    });
  });
});

