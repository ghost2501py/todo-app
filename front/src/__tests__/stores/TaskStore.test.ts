import { TaskStore } from '../../stores/TaskStore';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../../types/task.types';

// Mock the task service before importing
jest.mock('../../services/task.service');
jest.mock('../../services/api.service');

import { taskService } from '../../services/task.service';

describe('TaskStore', () => {
  let taskStore: TaskStore;
  let mockTaskService: jest.Mocked<typeof taskService>;

  beforeEach(() => {
    taskStore = new TaskStore();
    mockTaskService = taskService as jest.Mocked<typeof taskService>;
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with empty tasks array', () => {
      expect(taskStore.tasks).toEqual([]);
    });

    it('should initialize with loading as false', () => {
      expect(taskStore.loading).toBe(false);
    });

    it('should initialize with null error', () => {
      expect(taskStore.error).toBeNull();
    });

    it('should initialize with null success', () => {
      expect(taskStore.success).toBeNull();
    });

    it('should initialize with messageId as 0', () => {
      expect(taskStore.messageId).toBe(0);
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      taskStore.setLoading(true);
      expect(taskStore.loading).toBe(true);
    });

    it('should set loading state to false', () => {
      taskStore.setLoading(true);
      taskStore.setLoading(false);
      expect(taskStore.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      taskStore.setError('Error occurred');
      expect(taskStore.error).toBe('Error occurred');
    });

    it('should increment messageId when error is set', () => {
      const initialMessageId = taskStore.messageId;
      taskStore.setError('Error');
      expect(taskStore.messageId).toBe(initialMessageId + 1);
    });

    it('should clear error after 5 seconds', () => {
      taskStore.setError('Error');
      expect(taskStore.error).toBe('Error');

      jest.advanceTimersByTime(5000);
      expect(taskStore.error).toBeNull();
    });

    it('should set error to null when passed null', () => {
      taskStore.setError('Error');
      taskStore.setError(null);
      expect(taskStore.error).toBeNull();
    });

    it('should not increment messageId when error is cleared', () => {
      taskStore.setError('Error');
      const messageId = taskStore.messageId;
      taskStore.setError(null);
      expect(taskStore.messageId).toBe(messageId);
    });
  });

  describe('setSuccess', () => {
    it('should set success message', () => {
      taskStore.setSuccess('Success!');
      expect(taskStore.success).toBe('Success!');
    });

    it('should increment messageId when success is set', () => {
      const initialMessageId = taskStore.messageId;
      taskStore.setSuccess('Success');
      expect(taskStore.messageId).toBe(initialMessageId + 1);
    });

    it('should clear success after 3 seconds', () => {
      taskStore.setSuccess('Success');
      expect(taskStore.success).toBe('Success');

      jest.advanceTimersByTime(3000);
      expect(taskStore.success).toBeNull();
    });

    it('should set success to null when passed null', () => {
      taskStore.setSuccess('Success');
      taskStore.setSuccess(null);
      expect(taskStore.success).toBeNull();
    });
  });

  describe('fetchTasks', () => {
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

    it('should fetch tasks successfully', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      await taskStore.fetchTasks();

      expect(mockTaskService.getTasks).toHaveBeenCalled();
      expect(taskStore.tasks).toEqual(mockTasks);
      expect(taskStore.loading).toBe(false);
      expect(taskStore.error).toBeNull();
    });

    it('should set loading to true while fetching', () => {
      let resolvePromise: (value: Task[]) => void;
      mockTaskService.getTasks.mockImplementation(() =>
        new Promise(resolve => {
          resolvePromise = resolve;
        })
      );

      taskStore.fetchTasks();
      expect(taskStore.loading).toBe(true);

      // Cleanup
      resolvePromise!(mockTasks);
    });

    it('should handle fetch error', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Failed to fetch tasks'
          }
        }
      };
      mockTaskService.getTasks.mockRejectedValue(errorResponse);

      await taskStore.fetchTasks();

      expect(taskStore.error).toBe('Failed to fetch tasks');
      expect(taskStore.loading).toBe(false);
    });

    it('should handle fetch error without response data', async () => {
      mockTaskService.getTasks.mockRejectedValue(new Error('Network error'));

      await taskStore.fetchTasks();

      expect(taskStore.error).toBe('Error al traer las tareas');
      expect(taskStore.loading).toBe(false);
    });
  });

  describe('createTask', () => {
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

    it('should create task successfully', async () => {
      mockTaskService.createTask.mockResolvedValue(createdTask);

      await taskStore.createTask(taskData);

      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(taskStore.tasks).toContainEqual(createdTask);
      expect(taskStore.tasks[0]).toEqual(createdTask);
      expect(taskStore.success).toBe('Tarea creada exitosamente');
      expect(taskStore.loading).toBe(false);
    });

    it('should add new task at the beginning of the array', async () => {
      taskStore.tasks = [
        {
          _id: '1',
          title: 'Old Task',
          description: 'Old',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-01',
          deleted_at: null
        }
      ];

      mockTaskService.createTask.mockResolvedValue(createdTask);

      await taskStore.createTask(taskData);

      expect(taskStore.tasks[0]).toEqual(createdTask);
      expect(taskStore.tasks).toHaveLength(2);
    });

    it('should handle create error', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Failed to create task'
          }
        }
      };
      mockTaskService.createTask.mockRejectedValue(errorResponse);

      await taskStore.createTask(taskData);

      expect(taskStore.error).toBe('Failed to create task');
      expect(taskStore.loading).toBe(false);
      expect(taskStore.tasks).toHaveLength(0);
    });
  });

  describe('updateTask', () => {
    const updateData: UpdateTaskDTO = {
      title: 'Updated Task',
      status: 'completed'
    };

    beforeEach(() => {
      taskStore.tasks = [
        {
          _id: '1',
          title: 'Original Task',
          description: 'Description',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-01',
          deleted_at: null
        },
        {
          _id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-02',
          deleted_at: null
        }
      ];
    });

    it('should update task successfully', async () => {
      const updatedTask: Task = {
        ...taskStore.tasks[0],
        ...updateData
      };

      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskStore.updateTask('1', updateData);

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', updateData);
      expect(taskStore.tasks[0].title).toBe('Updated Task');
      expect(taskStore.tasks[0].status).toBe('completed');
      expect(taskStore.success).toBe('Tarea actualizada exitosamente');
    });

    it('should not affect other tasks', async () => {
      const updatedTask: Task = {
        ...taskStore.tasks[0],
        ...updateData
      };

      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskStore.updateTask('1', updateData);

      expect(taskStore.tasks[1].title).toBe('Task 2');
      expect(taskStore.tasks[1].status).toBe('pending');
    });

    it('should handle task not found', async () => {
      const updatedTask: Task = {
        _id: '999',
        title: 'Updated',
        description: 'Description',
        status: 'completed',
        user_id: 'user123',
        created_at: '2024-01-01',
        deleted_at: null
      };

      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskStore.updateTask('999', updateData);

      // Original tasks should remain unchanged
      expect(taskStore.tasks).toHaveLength(2);
      expect(taskStore.tasks[0].title).toBe('Original Task');
    });

    it('should handle update error', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Failed to update task'
          }
        }
      };
      mockTaskService.updateTask.mockRejectedValue(errorResponse);

      await taskStore.updateTask('1', updateData);

      expect(taskStore.error).toBe('Failed to update task');
      expect(taskStore.tasks[0].title).toBe('Original Task');
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      taskStore.tasks = [
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
    });

    it('should delete task successfully', async () => {
      mockTaskService.deleteTask.mockResolvedValue();

      await taskStore.deleteTask('1');

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1');
      expect(taskStore.tasks).toHaveLength(1);
      expect(taskStore.tasks[0]._id).toBe('2');
      expect(taskStore.success).toBe('Tarea borrada exitosamente');
    });

    it('should handle delete error', async () => {
      const errorResponse = {
        response: {
          data: {
            error: 'Failed to delete task'
          }
        }
      };
      mockTaskService.deleteTask.mockRejectedValue(errorResponse);

      await taskStore.deleteTask('1');

      expect(taskStore.error).toBe('Failed to delete task');
      expect(taskStore.tasks).toHaveLength(2);
    });

    it('should not fail if task not in local state', async () => {
      mockTaskService.deleteTask.mockResolvedValue();

      await taskStore.deleteTask('999');

      expect(taskStore.tasks).toHaveLength(2);
      expect(taskStore.success).toBe('Tarea borrada exitosamente');
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      taskStore.tasks = [
        {
          _id: '1',
          title: 'Pending Task 1',
          description: 'Description 1',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-01',
          deleted_at: null
        },
        {
          _id: '2',
          title: 'Completed Task 1',
          description: 'Description 2',
          status: 'completed',
          user_id: 'user123',
          created_at: '2024-01-02',
          deleted_at: null
        },
        {
          _id: '3',
          title: 'Pending Task 2',
          description: 'Description 3',
          status: 'pending',
          user_id: 'user123',
          created_at: '2024-01-03',
          deleted_at: null
        },
        {
          _id: '4',
          title: 'Completed Task 2',
          description: 'Description 4',
          status: 'completed',
          user_id: 'user123',
          created_at: '2024-01-04',
          deleted_at: null
        }
      ];
    });

    it('should return only pending tasks', () => {
      const pending = taskStore.pendingTasks;
      expect(pending).toHaveLength(2);
      expect(pending.every(task => task.status === 'pending')).toBe(true);
    });

    it('should return only completed tasks', () => {
      const completed = taskStore.completedTasks;
      expect(completed).toHaveLength(2);
      expect(completed.every(task => task.status === 'completed')).toBe(true);
    });

    it('should return empty array when no pending tasks', () => {
      taskStore.tasks = taskStore.tasks.filter(t => t.status === 'completed');
      expect(taskStore.pendingTasks).toHaveLength(0);
    });

    it('should return empty array when no completed tasks', () => {
      taskStore.tasks = taskStore.tasks.filter(t => t.status === 'pending');
      expect(taskStore.completedTasks).toHaveLength(0);
    });
  });
});

