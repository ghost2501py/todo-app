import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/user.types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema({
  auth0_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IUserDocument>('User', UserSchema);

