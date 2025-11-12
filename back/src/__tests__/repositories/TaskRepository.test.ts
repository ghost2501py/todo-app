import { TaskRepository } from '../../repositories/TaskRepository';
import TaskModel from '../../models/Task.model';
import { CreateTaskDTO, UpdateTaskDTO } from '../../types/task.types';

// Mock the TaskModel
jest.mock('../../models/Task.model');

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;

  beforeEach(() => {
    taskRepository = new TaskRepository();
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find all tasks for a user excluding deleted ones', async () => {
      const userId = 'user123';
      const mockTasks = [
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

      const mockSort = jest.fn().mockResolvedValue(mockTasks);
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      (TaskModel.find as jest.Mock) = mockFind;

      const result = await taskRepository.findByUserId(userId);

      expect(mockFind).toHaveBeenCalledWith({
        user_id: userId,
        deleted_at: null
      });
      expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
    });

    it('should return empty array if no tasks found', async () => {
      const userId = 'user123';
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      (TaskModel.find as jest.Mock) = mockFind;

      const result = await taskRepository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should exclude soft deleted tasks', async () => {
      const userId = 'user123';
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      (TaskModel.find as jest.Mock) = mockFind;

      await taskRepository.findByUserId(userId);

      expect(mockFind).toHaveBeenCalledWith({
        user_id: userId,
        deleted_at: null
      });
    });
  });

  describe('findById', () => {
    it('should find a task by id and user id', async () => {
      const taskId = '1';
      const userId = 'user123';
      const mockTask = {
        _id: taskId,
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      (TaskModel.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskRepository.findById(taskId, userId);

      expect(TaskModel.findOne).toHaveBeenCalledWith({
        _id: taskId,
        user_id: userId,
        deleted_at: null
      });
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Task 1');
    });

    it('should return null if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';

      (TaskModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await taskRepository.findById(taskId, userId);

      expect(TaskModel.findOne).toHaveBeenCalledWith({
        _id: taskId,
        user_id: userId,
        deleted_at: null
      });
      expect(result).toBeNull();
    });

    it('should not find tasks from other users', async () => {
      const taskId = '1';
      const userId = 'user123';

      (TaskModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await taskRepository.findById(taskId, userId);

      expect(TaskModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: userId })
      );
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const userId = 'user123';
      const taskData: CreateTaskDTO = {
        title: 'New Task',
        description: 'New Description'
      };

      const mockSavedTask = {
        _id: '1',
        ...taskData,
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null,
        save: jest.fn()
      };

      const mockSave = jest.fn().mockResolvedValue(mockSavedTask);
      mockSavedTask.save = mockSave;

      (TaskModel as any).mockImplementation(() => mockSavedTask);

      const result = await taskRepository.create(userId, taskData);

      expect(result.title).toBe('New Task');
      expect(result.description).toBe('New Description');
      expect(result.status).toBe('pending');
      expect(result.user_id).toBe(userId);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should set status to pending by default', async () => {
      const userId = 'user123';
      const taskData: CreateTaskDTO = {
        title: 'Task',
        description: 'Description'
      };

      const mockSavedTask = {
        _id: '1',
        ...taskData,
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null,
        save: jest.fn()
      };

      mockSavedTask.save.mockResolvedValue(mockSavedTask);
      (TaskModel as any).mockImplementation(() => mockSavedTask);

      const result = await taskRepository.create(userId, taskData);

      expect(result.status).toBe('pending');
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        title: 'Updated Task',
        status: 'completed'
      };

      const mockUpdatedTask = {
        _id: taskId,
        title: 'Updated Task',
        description: 'Description',
        status: 'completed',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      };

      (TaskModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTask);

      const result = await taskRepository.update(taskId, userId, updateData);

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: taskId,
          user_id: userId,
          deleted_at: null
        },
        { $set: updateData },
        { new: true }
      );
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Updated Task');
      expect(result?.status).toBe('completed');
    });

    it('should return null if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = {
        title: 'Updated'
      };

      (TaskModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await taskRepository.update(taskId, userId, updateData);

      expect(result).toBeNull();
    });

    it('should not update deleted tasks', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = { title: 'Updated' };

      (TaskModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await taskRepository.update(taskId, userId, updateData);

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: null }),
        expect.anything(),
        expect.anything()
      );
    });

    it('should return updated document with new: true option', async () => {
      const taskId = '1';
      const userId = 'user123';
      const updateData: UpdateTaskDTO = { title: 'Updated' };

      (TaskModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        _id: taskId,
        title: 'Updated',
        description: 'Description',
        status: 'pending',
        user_id: userId,
        created_at: new Date(),
        deleted_at: null
      });

      await taskRepository.update(taskId, userId, updateData);

      expect(TaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { new: true }
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a task', async () => {
      const taskId = '1';
      const userId = 'user123';

      (TaskModel.updateOne as jest.Mock).mockResolvedValue({
        modifiedCount: 1
      });

      const result = await taskRepository.softDelete(taskId, userId);

      expect(TaskModel.updateOne).toHaveBeenCalledWith(
        {
          _id: taskId,
          user_id: userId,
          deleted_at: null
        },
        { $set: { deleted_at: expect.any(Date) } }
      );
      expect(result).toBe(true);
    });

    it('should return false if task not found', async () => {
      const taskId = '999';
      const userId = 'user123';

      (TaskModel.updateOne as jest.Mock).mockResolvedValue({
        modifiedCount: 0
      });

      const result = await taskRepository.softDelete(taskId, userId);

      expect(result).toBe(false);
    });

    it('should not delete already deleted tasks', async () => {
      const taskId = '1';
      const userId = 'user123';

      (TaskModel.updateOne as jest.Mock).mockResolvedValue({
        modifiedCount: 0
      });

      await taskRepository.softDelete(taskId, userId);

      expect(TaskModel.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: null }),
        expect.anything()
      );
    });

    it('should set deleted_at to current date', async () => {
      const taskId = '1';
      const userId = 'user123';
      const beforeDelete = new Date();

      (TaskModel.updateOne as jest.Mock).mockImplementation((filter, update) => {
        const deletedAt = update.$set.deleted_at;
        expect(deletedAt).toBeInstanceOf(Date);
        expect(deletedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
        return Promise.resolve({ modifiedCount: 1 });
      });

      await taskRepository.softDelete(taskId, userId);
    });
  });
});

