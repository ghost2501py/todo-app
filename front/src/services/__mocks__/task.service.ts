// Manual mock for task.service

export const taskService = {
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
};

export class TaskService {
  getTasks = taskService.getTasks;
  getTaskById = taskService.getTaskById;
  createTask = taskService.createTask;
  updateTask = taskService.updateTask;
  deleteTask = taskService.deleteTask;
}



