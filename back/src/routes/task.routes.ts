import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { validateRequest } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();
const taskController = new TaskController();

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateRequest(createTaskSchema), taskController.createTask);
router.put('/:id', validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;

