import TaskModel, { ITaskDocument } from '../models/Task.model';
import { ITask, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types';

export class TaskRepository {
  async findByUserId(userId: string): Promise<ITask[]> {
    const tasks = await TaskModel.find({
      user_id: userId,
      deleted_at: null
    }).sort({ created_at: -1 });

    return tasks.map(task => this.toJSON(task));
  }

  async findById(id: string, userId: string): Promise<ITask | null> {
    const task = await TaskModel.findOne({
      _id: id,
      user_id: userId,
      deleted_at: null
    });

    return task ? this.toJSON(task) : null;
  }

  async create(userId: string, data: CreateTaskDTO): Promise<ITask> {
    const task = new TaskModel({
      ...data,
      user_id: userId,
      status: 'pending'
    });

    const savedTask = await task.save();
    return this.toJSON(savedTask);
  }

  async update(id: string, userId: string, data: UpdateTaskDTO): Promise<ITask | null> {
    const task = await TaskModel.findOneAndUpdate(
      {
        _id: id,
        user_id: userId,
        deleted_at: null
      },
      { $set: data },
      { new: true }
    );

    return task ? this.toJSON(task) : null;
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await TaskModel.updateOne(
      {
        _id: id,
        user_id: userId,
        deleted_at: null
      },
      { $set: { deleted_at: new Date() } }
    );

    return result.modifiedCount > 0;
  }

  private toJSON(task: ITaskDocument): ITask {
    return {
      _id: (task._id as any).toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      user_id: task.user_id,
      created_at: task.created_at,
      deleted_at: task.deleted_at
    };
  }
}

