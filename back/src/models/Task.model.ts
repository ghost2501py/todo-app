import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types/task.types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  }
});

TaskSchema.index({ user_id: 1, deleted_at: 1 });

export default mongoose.model<ITaskDocument>('Task', TaskSchema);

