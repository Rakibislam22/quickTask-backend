import { Router } from 'express';
import { createTask, getTasks, deleteTask, updateTaskStatus } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// protected routes for task management
router.use(authenticate);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:taskId', updateTaskStatus);
router.delete('/:taskId', deleteTask);

export default router;