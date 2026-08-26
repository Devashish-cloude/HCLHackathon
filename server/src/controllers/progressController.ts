import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class ProgressController {
  static async completeLesson(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { lessonId, completed, score } = req.body;

      if (!userId || !lessonId) {
        return res.status(400).json({ success: false, message: 'Lesson ID and completion state are required' });
      }

      // 1. Save or update UserProgress record
      const progress = await prisma.userProgress.upsert({
        where: {
          userId_lessonId: { userId, lessonId }
        },
        update: {
          completed,
          score: score !== undefined ? score : null,
          completedAt: completed ? new Date() : null
        },
        create: {
          userId,
          lessonId,
          completed,
          score: score !== undefined ? score : null,
          completedAt: completed ? new Date() : null
        }
      });

      // 2. Fetch the lesson and its module structure
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            include: {
              course: true,
              lessons: true
            }
          }
        }
      });

      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      // 3. Evaluate if module is now complete
      const moduleLessons = lesson.module.lessons;
      const completedModuleLessons = await prisma.userProgress.count({
        where: {
          userId,
          completed: true,
          lessonId: { in: moduleLessons.map(l => l.id) }
        }
      });

      const isModuleCompleted = completedModuleLessons === moduleLessons.length;

      // 4. Update the learning path item corresponding to this module
      const learningPath = await prisma.learningPath.findUnique({ where: { userId } });
      if (learningPath && isModuleCompleted) {
        const pathItem = await prisma.learningPathItem.findFirst({
          where: {
            learningPathId: learningPath.id,
            moduleId: lesson.moduleId
          }
        });

        if (pathItem && pathItem.status !== 'Completed') {
          // Complete current item
          await prisma.learningPathItem.update({
            where: { id: pathItem.id },
            data: { status: 'Completed' }
          });

          // Automatically unlock next item in sequence
          const nextItem = await prisma.learningPathItem.findFirst({
            where: {
              learningPathId: learningPath.id,
              order: pathItem.order + 1
            }
          });

          if (nextItem && nextItem.status === 'Locked') {
            await prisma.learningPathItem.update({
              where: { id: nextItem.id },
              data: { status: 'InProgress' }
            });

            // Create notification for new module
            await prisma.notification.create({
              data: {
                userId,
                title: 'New module unlocked!',
                message: `You've unlocked the next topic: ${nextItem.title}`,
                type: 'COMPLETION'
              }
            });
          }
        }
      }

      // 5. Track study session metrics
      await prisma.learningSession.create({
        data: {
          userId,
          durationMinutes: lesson.duration
        }
      });

      // 6. Update user skill score slightly for general practice
      let skillMatched = 'JS Fundamentals';
      if (lesson.module.course.title.toLowerCase().includes('async')) {
        skillMatched = 'Async Programming';
      } else if (lesson.module.course.title.toLowerCase().includes('dom')) {
        skillMatched = 'DOM Manipulation';
      } else if (lesson.module.course.title.toLowerCase().includes('es6')) {
        skillMatched = 'ES6+ Features';
      } else if (lesson.module.course.title.toLowerCase().includes('api')) {
        skillMatched = 'API Integration';
      }

      const dbSkill = await prisma.skill.findUnique({ where: { name: skillMatched } });
      if (dbSkill) {
        const us = await prisma.userSkill.findUnique({
          where: { userId_skillId: { userId, skillId: dbSkill.id } }
        });
        if (us) {
          const addedScore = completed ? 3 : -1;
          const newScore = Math.min(100, Math.max(0, us.score + addedScore));
          await prisma.userSkill.update({
            where: { id: us.id },
            data: { score: newScore }
          });
        }
      }

      return res.json({
        success: true,
        message: 'Progress saved successfully',
        progress,
        isModuleCompleted
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
