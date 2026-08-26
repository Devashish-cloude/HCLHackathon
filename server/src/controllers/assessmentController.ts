import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { RecommendationService } from '../services/recommendationService';

const prisma = new PrismaClient();

export class AssessmentController {
  static async listAssessments(req: Request, res: Response) {
    try {
      const assessments = await prisma.assessment.findMany({
        include: {
          _count: {
            select: { questions: true }
          }
        }
      });
      return res.json({ success: true, assessments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAssessment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          questions: {
            select: {
              id: true,
              questionText: true,
              type: true,
              options: true,
              points: true
            }
          }
        }
      });

      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }

      return res.json({ success: true, assessment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async submitAssessment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { answers } = req.body; // Map: { [questionId]: answerValue }

      if (!userId || !answers) {
        return res.status(400).json({ success: false, message: 'Answers payload is required' });
      }

      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: { questions: true }
      });

      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }

      // Grade questions
      let score = 0;
      let maxScore = 0;
      const questionBreakdown: any[] = [];

      for (const q of assessment.questions) {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer !== undefined && String(userAnswer).trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

        maxScore += q.points;
        if (isCorrect) {
          score += q.points;
        }

        questionBreakdown.push({
          questionId: q.id,
          questionText: q.questionText,
          correct: isCorrect,
          userAnswer: userAnswer || '',
          correctAnswer: q.correctAnswer
        });
      }

      const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const passed = scorePercentage >= 60; // 60% passing mark

      // AI feedback simulation
      const feedback = {
        scorePercentage,
        passed,
        summary: passed
          ? `Great job! You passed the assessment. You showed solid competency in this area.`
          : `You scored ${scorePercentage}%. Review recommended topics on Promise.all and try/catch errors before attempting again.`,
        questionBreakdown
      };

      // Save attempt to DB
      const attempt = await prisma.assessmentAttempt.create({
        data: {
          userId,
          assessmentId: id,
          score,
          maxScore,
          passed,
          answers,
          feedback
        }
      });

      // 4. Trigger Adaptive Learning Path Adjustments!
      await RecommendationService.evaluateAssessmentAttempt(userId, id, scorePercentage);

      return res.json({
        success: true,
        message: 'Assessment graded successfully',
        attempt: {
          id: attempt.id,
          score,
          maxScore,
          scorePercentage,
          passed,
          feedback
        }
      });

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
