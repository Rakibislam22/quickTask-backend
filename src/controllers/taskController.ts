import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Create Task
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.userId;

    // Premium Check and Task Limit Logic
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.isPremium) {
      const taskCount = await prisma.task.count({ where: { userId } });
      if (taskCount >= 3) {
        res.status(403).json({ 
          message: 'Free limit reached. Upgrade to premium for unlimited tasks.' 
        });
        return;
      }
    }

    const newTask = await prisma.task.create({
      data: { title, description, status: status || 'To Do', userId }
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

// Get All Tasks for logged-in user
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
};

// Delete Task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.taskId as string;
    const userId = req.user?.userId as string;

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found or unauthorized' });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};
