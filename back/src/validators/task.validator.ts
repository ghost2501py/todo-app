import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').max(1000, 'Description too long').optional(),
  status: z.enum(['pending', 'completed']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided'
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

