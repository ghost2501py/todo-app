export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  user_id: string;
  created_at: string;
  deleted_at: string | null;
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

