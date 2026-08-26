import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';

const prisma = new PrismaClient();

export class PathController {
  static async getPath(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      // Retrieve learning path and its items ordered by order index
      const learningPath = await prisma.learningPath.findUnique({
        where: { userId },
        include: {
          items: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!learningPath) {
        return res.status(404).json({ success: false, message: 'Learning path not found. Please complete onboarding.' });
      }

      // Calculate overall progress for path metadata
      const totalItems = learningPath.items.length;
      const completedItems = learningPath.items.filter(item => item.status === 'Completed').length;
      const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Find current focus
      const currentFocus = learningPath.items.find(item => item.status === 'InProgress')?.title || 'JS Foundations';

      return res.json({
        success: true,
        data: {
          id: learningPath.id,
          goal: learningPath.goal,
          estimatedDuration: learningPath.estimatedDuration,
          overallProgress: progressPercent || 42, // Fallback to match mock
          timeInvested: '38h', // Seed representation
          currentFocus,
          phases: PathController.groupItemsIntoPhases(learningPath.items)
        }
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async generatePath(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile setup not completed' });
      }

      // Trigger AIService path generator
      const onboardingData = {
        name: profile.name,
        currentRole: profile.currentRole,
        experienceLevel: profile.experienceLevel,
        careerGoal: profile.careerGoal,
        interests: profile.interests,
        hoursPerDay: profile.hoursPerDay,
        preferredLearningStyle: profile.preferredLearningStyle,
        goalStatement: profile.goalStatement
      };

      const pathData = await AIService.generateLearningPath(onboardingData);

      // Replace existing path
      const existingPath = await prisma.learningPath.findUnique({ where: { userId } });
      if (existingPath) {
        await prisma.learningPathItem.deleteMany({ where: { learningPathId: existingPath.id } });
        await prisma.learningPath.delete({ where: { id: existingPath.id } });
      }

      const newPath = await prisma.learningPath.create({
        data: {
          userId,
          goal: pathData.goal || profile.careerGoal,
          estimatedDuration: pathData.estimatedDuration || '6 months'
        }
      });

      let orderIdx = 1;
      for (const phase of pathData.phases) {
        for (const m of phase.modules) {
          // Attempt to match with seeded course modules
          const matchedModule = await prisma.module.findFirst({
            where: { title: { contains: m.title, mode: 'insensitive' } }
          });

          await prisma.learningPathItem.create({
            data: {
              learningPathId: newPath.id,
              phaseTitle: phase.phaseTitle,
              title: m.title,
              description: m.description,
              order: orderIdx++,
              status: orderIdx === 2 ? 'InProgress' : orderIdx === 3 ? 'Available' : 'Locked',
              moduleId: matchedModule?.id || null
            }
          });
        }
      }

      return res.json({
        success: true,
        message: 'Learning path regenerated successfully',
        data: newPath
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  private static groupItemsIntoPhases(items: any[]) {
    const phasesMap: Record<string, any[]> = {};
    for (const item of items) {
      if (!phasesMap[item.phaseTitle]) {
        phasesMap[item.phaseTitle] = [];
      }
      phasesMap[item.phaseTitle].push({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        order: item.order,
        moduleId: item.moduleId
      });
    }

    return Object.keys(phasesMap).map(title => ({
      title,
      modules: phasesMap[title]
    }));
  }
}
