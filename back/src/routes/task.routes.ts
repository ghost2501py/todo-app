import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { validateRequest } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validator';
import { checkJwt } from '../middleware/auth.middleware';
import { ensureUserExists } from '../middleware/user.middleware';

const router = Router();
const taskController = new TaskController();

router.use(checkJwt);
router.use(ensureUserExists);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateRequest(createTaskSchema), taskController.createTask);
router.put('/:id', validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;

