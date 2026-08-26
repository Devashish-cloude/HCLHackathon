import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      });

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      return res.json({ success: true, profile });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { name, currentRole, experienceLevel, careerGoal, interests, hoursPerDay, preferredLearningStyle, goalStatement } = req.body;

      const profile = await prisma.profile.update({
        where: { userId },
        data: {
          name,
          currentRole,
          experienceLevel,
          careerGoal,
          interests,
          hoursPerDay: parseFloat(hoursPerDay) || 1.0,
          preferredLearningStyle,
          goalStatement
        }
      });

      return res.json({ success: true, message: 'Profile updated successfully', profile });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      // Run independent queries in parallel via a single round trip
      const [
        profile,
        totalLessons,
        completedProgressRecords,
        skillsMastered,
        courses,
        learningPath,
        todaysFocus,
        recommendations
      ] = await Promise.all([
        prisma.profile.findUnique({ where: { userId } }),
        prisma.lesson.count(),
        prisma.userProgress.findMany({
          where: { userId, completed: true },
          select: { lessonId: true }
        }),
        prisma.userSkill.count({
          where: { userId, score: { gte: 70 } }
        }),
        prisma.course.findMany({
          include: {
            modules: {
              include: { lessons: true }
            }
          }
        }),
        prisma.learningPath.findUnique({
          where: { userId },
          include: { items: { orderBy: { order: 'asc' } } }
        }),
        prisma.dailyTask.findMany({
          where: { userId },
          orderBy: { id: 'asc' }
        }),
        prisma.recommendation.findMany({
          where: { userId, clicked: false },
          take: 2,
          orderBy: { createdAt: 'desc' }
        })
      ]);

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      // Fast in-memory Set lookup
      const completedLessonIds = new Set(completedProgressRecords.map(p => p.lessonId));
      const overallProgress = totalLessons > 0 ? Math.round((completedProgressRecords.length / totalLessons) * 100) : 0;

      // Fast in-memory course completion calculation
      let coursesCompleted = 0;
      for (const course of courses) {
        const courseLessons = course.modules.flatMap(m => m.lessons);
        if (courseLessons.length === 0) continue;

        const allCompleted = courseLessons.every(l => completedLessonIds.has(l.id));
        if (allCompleted) {
          coursesCompleted++;
        }
      }

      // Continue Learning details
      let continueLearning = null;
      let activePathItem = learningPath?.items.find(item => item.status === 'InProgress');
      if (!activePathItem) {
        activePathItem = learningPath?.items.find(item => item.status === 'Available');
      }

      if (activePathItem && activePathItem.moduleId) {
        let activeModule = null;
        let activeCourse = null;
        for (const c of courses) {
          const mod = c.modules.find(m => m.id === activePathItem!.moduleId);
          if (mod) {
            activeModule = mod;
            activeCourse = c;
            break;
          }
        }

        if (activeCourse && activeModule) {
          const courseLessons = activeCourse.modules.flatMap(m => m.lessons);
          const completedCount = courseLessons.filter(l => completedLessonIds.has(l.id)).length;
          const courseProgress = courseLessons.length > 0
            ? Math.round((completedCount / courseLessons.length) * 100)
            : 0;

          continueLearning = {
            courseId: activeCourse.id,
            moduleId: activeModule.id,
            courseTitle: activeCourse.title,
            courseDescription: activeCourse.description,
            moduleTitle: activeModule.title,
            progressPercentage: courseProgress,
            durationRemaining: '42 min remaining',
            imageUrl: activeCourse.imageUrl
          };
        }
      } else {
        const asyncCourse = courses.find(c => c.title.toLowerCase().includes('async')) || courses[0];
        const targetModule = asyncCourse?.modules?.[0];
        continueLearning = {
          courseId: asyncCourse?.id || '',
          moduleId: targetModule?.id || '',
          courseTitle: asyncCourse?.title || 'JavaScript Async Programming',
          courseDescription: asyncCourse?.description || 'Master Promises, async/await, and event loops to handle complex data fetching and UI updates.',
          moduleTitle: targetModule ? 'Module 1 of ' + asyncCourse.modules.length : 'Module 3 of 5',
          progressPercentage: 65,
          durationRemaining: '42 min remaining',
          imageUrl: asyncCourse?.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop'
        };
      }

      // Learning path nodes for timeline render
      const learningPathNodes = learningPath?.items.map(item => ({
        id: item.id,
        title: item.title,
        status: item.status
      })) || [
        { id: '1', title: 'JS Fundamentals', status: 'Completed' },
        { id: '2', title: 'DOM Manipulation', status: 'Completed' },
        { id: '3', title: 'Async Programming', status: 'InProgress' },
        { id: '4', title: 'APIs', status: 'Locked' },
        { id: '5', title: 'React', status: 'Locked' }
      ];

      return res.json({
        success: true,
        data: {
          user: {
            name: profile.name,
            streak: profile.streak,
            careerGoal: profile.careerGoal
          },
          stats: {
            overallProgress,
            learningStreak: profile.streak,
            skillsMastered,
            coursesCompleted
          },
          continueLearning,
          todaysFocus,
          learningPathNodes,
          recommendations
        }
      });

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async completeDailyTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { taskId, completed } = req.body;

      if (!userId || !taskId) {
        return res.status(400).json({ success: false, message: 'Task ID and status are required' });
      }

      const task = await prisma.dailyTask.update({
        where: { id: taskId, userId },
        data: {
          completed,
          completedAt: completed ? new Date() : null
        }
      });

      // Daily streak logic
      if (completed) {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (profile) {
          const lastActive = profile.lastActive;
          const today = new Date();
          let newStreak = profile.streak;

          // Increment streak if last active was yesterday, or reset if missed.
          // For local testing simplicity, we increment if not active today.
          const isSameDay = lastActive && lastActive.toDateString() === today.toDateString();
          if (!isSameDay) {
            newStreak += 1;
            await prisma.profile.update({
              where: { userId },
              data: { streak: newStreak, lastActive: today }
            });

            // Send notification
            await prisma.notification.create({
              data: {
                userId,
                title: 'Learning Streak Continued!',
                message: `You've completed a focus task today! Current streak: ${newStreak} days.`,
                type: 'STREAK'
              }
            });
          }
        }
      }

      return res.json({ success: true, message: 'Task updated successfully', task });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
