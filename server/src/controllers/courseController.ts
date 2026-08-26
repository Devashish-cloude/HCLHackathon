import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class CourseController {
  static async listCourses(req: Request, res: Response) {
    try {
      const { search, difficulty, tag } = req.query;

      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (difficulty) {
        whereClause.difficulty = difficulty as string;
      }

      if (tag) {
        whereClause.tags = { has: tag as string };
      }

      const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          modules: {
            select: { id: true, title: true }
          }
        },
        orderBy: { title: 'asc' }
      });

      return res.json({ success: true, courses });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getCourse(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      let course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!course) {
        // Fallback: Check if the ID provided is a moduleId
        const moduleRecord = await prisma.module.findUnique({
          where: { id },
          select: { courseId: true }
        });
        
        if (moduleRecord) {
          course = await prisma.course.findUnique({
            where: { id: moduleRecord.courseId },
            include: {
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          });
        }
      }

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Fetch user progress for all lessons in this course
      const lessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
      const userProgress = await prisma.userProgress.findMany({
        where: {
          userId,
          lessonId: { in: lessonIds }
        }
      });

      const completedMap: Record<string, boolean> = {};
      const scoreMap: Record<string, number> = {};
      for (const p of userProgress) {
        completedMap[p.lessonId] = p.completed;
        if (p.score !== null) {
          scoreMap[p.lessonId] = p.score;
        }
      }

      // Map progress completion onto the lesson structure
      const formattedModules = course.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
          ...l,
          completed: completedMap[l.id] || false,
          score: scoreMap[l.id] || null
        }))
      }));

      // Calculate course level stats
      const totalLessons = lessonIds.length;
      const completedCount = Object.values(completedMap).filter(val => val === true).length;
      const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      return res.json({
        success: true,
        course: {
          ...course,
          modules: formattedModules,
          progressPercentage: percentComplete,
          completedLessonsCount: completedCount,
          totalLessonsCount: totalLessons
        }
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async enroll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: { lessons: true }
          }
        }
      });

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Enrollment logic: Ensure the user's active learning path features this course's modules
      const learningPath = await prisma.learningPath.findUnique({ where: { userId } });
      if (learningPath) {
        // Check if course already exists in path
        const firstModule = course.modules[0];
        if (firstModule) {
          const pathItemExists = await prisma.learningPathItem.findFirst({
            where: {
              learningPathId: learningPath.id,
              moduleId: firstModule.id
            }
          });

          if (!pathItemExists) {
            // Append course to the learning path
            const count = await prisma.learningPathItem.count({ where: { learningPathId: learningPath.id } });
            await prisma.learningPathItem.create({
              data: {
                learningPathId: learningPath.id,
                phaseTitle: 'Phase 3 - Architecture & Frameworks',
                title: course.title,
                description: course.description,
                order: count + 1,
                status: 'Available',
                moduleId: firstModule.id
              }
            });
          }
        }
      }

      // Automatically initialize user progress records for this course's first lesson so it is ready
      const firstLesson = course.modules[0]?.lessons[0];
      if (firstLesson) {
        await prisma.userProgress.upsert({
          where: {
            userId_lessonId: { userId, lessonId: firstLesson.id }
          },
          update: {},
          create: {
            userId,
            lessonId: firstLesson.id,
            completed: false
          }
        });
      }

      return res.json({
        success: true,
        message: 'Successfully enrolled in course and added to learning path',
        courseId: course.id
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
