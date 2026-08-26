import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class NotificationController {
  static async listNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, notifications });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const notification = await prisma.notification.update({
        where: { id, userId },
        data: { read: true }
      });

      return res.json({ success: true, notification });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
