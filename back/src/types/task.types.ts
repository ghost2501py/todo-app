export interface ITask {
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  user_id: string;
  created_at: Date;
  deleted_at: Date | null;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
}

