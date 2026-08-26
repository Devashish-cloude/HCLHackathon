import { PrismaClient, SkillLevel, RecommendationType, TaskType } from '@prisma/client';

const prisma = new PrismaClient();

export class RecommendationService {
  /**
   * Processes an assessment attempt and adapts the learning path, skills, and recommendations
   */
  static async evaluateAssessmentAttempt(userId: string, assessmentId: string, scorePercentage: number) {
    // 1. Get the assessment to understand what skills it tests
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true }
    });

    if (!assessment) return;

    // We map assessment keywords to specific skills
    let targetSkillName = 'Async Programming';
    if (assessment.title.toLowerCase().includes('basic') || assessment.title.toLowerCase().includes('control')) {
      targetSkillName = 'JS Fundamentals';
    }

    // Find the skill in DB
    const skill = await prisma.skill.findUnique({
      where: { name: targetSkillName }
    });

    if (!skill) return;

    // Get current UserSkill
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: { userId, skillId: skill.id }
      }
    });

    const currentScore = userSkill ? userSkill.score : 30;
    // Calculate new skill score (blend current score and assessment performance)
    const newScore = Math.min(100, Math.max(0, Math.round(currentScore * 0.4 + scorePercentage * 0.6)));

    // Determine skill level
    let level: SkillLevel = SkillLevel.BEGINNER;
    if (newScore >= 80) level = SkillLevel.ADVANCED;
    else if (newScore >= 50) level = SkillLevel.INTERMEDIATE;

    // Update user skill
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      update: { score: newScore, level },
      create: { userId, skillId: skill.id, score: newScore, level }
    });

    // 2. Adaptive Logic based on score
    if (scorePercentage < 60) {
      // LOW PERFORMANCE: Create critical recommendation, add study tasks, restrict/lock next module
      console.log(`Adapting learning path for user ${userId} due to low assessment score: ${scorePercentage}%`);

      // Add a recommended course for this specific skill if not already recommended
      const relatedCourse = await prisma.course.findFirst({
        where: {
          OR: [
            { title: { contains: targetSkillName, mode: 'insensitive' } },
            { description: { contains: targetSkillName, mode: 'insensitive' } }
          ]
        }
      });

      if (relatedCourse) {
        await prisma.recommendation.create({
          data: {
            userId,
            title: `Review: ${relatedCourse.title}`,
            description: `A score of ${scorePercentage}% was detected in your latest assessment. Take this course to master ${targetSkillName}.`,
            type: RecommendationType.COURSE,
            targetId: relatedCourse.id,
            explanation: `Recommended because your score on the ${assessment.title} was ${scorePercentage}%, highlighting a critical gap in ${targetSkillName}.`
          }
        });

        // Add a daily task for review
        await prisma.dailyTask.create({
          data: {
            userId,
            taskText: `Review ${targetSkillName} fundamentals and exercises`,
            taskType: TaskType.REVIEW,
            estimatedTime: '25 min',
            completed: false
          }
        });
      }

      // Add notification
      await prisma.notification.create({
        data: {
          userId,
          title: 'Adaptive Study Plan Triggered',
          message: `We noticed you had some difficulty with ${targetSkillName}. We've recommended some review modules.`,
          type: 'RECOMMENDATION'
        }
      });

    } else {
      // HIGH PERFORMANCE: Unlock next phases, add advanced exercises, boost score
      console.log(`Unlocking achievements/modules for user ${userId} due to high score: ${scorePercentage}%`);

      // Find the next locked item in their learning path and unlock it
      const learningPath = await prisma.learningPath.findUnique({
        where: { userId }
      });

      if (learningPath) {
        const nextLockedItem = await prisma.learningPathItem.findFirst({
          where: {
            learningPathId: learningPath.id,
            status: 'Locked'
          },
          orderBy: { order: 'asc' }
        });

        if (nextLockedItem) {
          await prisma.learningPathItem.update({
            where: { id: nextLockedItem.id },
            data: { status: 'Available' }
          });

          // Add notification
          await prisma.notification.create({
            data: {
              userId,
              title: 'New module unlocked!',
              message: `Congratulations! Your score of ${scorePercentage}% unlocked the module: ${nextLockedItem.title}.`,
              type: 'COMPLETION'
            }
          });
        }
      }

      // Recommend advanced assessments or advanced project capstone
      await prisma.recommendation.create({
        data: {
          userId,
          title: `Advanced ${targetSkillName} Challenges`,
          description: 'Ready to put your skills to the test? Take on our custom-tailored coding challenges.',
          type: RecommendationType.EXERCISE,
          targetId: assessment.id, // target the assessment or a project
          explanation: `Recommended because you mastered ${targetSkillName} with a score of ${scorePercentage}%.`
        }
      });
    }
  }

  /**
   * Gathers Identified Gap Areas for the skill-analysis dashboard
   * We look for skills where score is < 70%.
   */
  static async detectSkillGaps(userId: string) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true }
    });

    const gaps = [];

    for (const us of userSkills) {
      if (us.score < 70) {
        const severity = us.score < 50 ? 'Critical' : 'Moderate';
        let evidence = `Assessed proficiency is currently at ${us.score}%.`;
        let recommendation = '';

        if (us.skill.name === 'Async Programming') {
          evidence = 'Struggles observed with Promise.all and error bubbling in complex chains.';
          recommendation = 'Complete Async/Await lesson, practice with chained catch catch handlers.';
        } else if (us.skill.name === 'API Integration') {
          evidence = 'Needs deeper understanding of RESTful principles and handling varied HTTP status codes gracefully.';
          recommendation = 'Enroll in APIs & Fetch course, write local fetch queries.';
        } else if (us.skill.name === 'Error Handling') {
          evidence = 'Inconsistent use of try/catch blocks and custom error boundaries.';
          recommendation = 'Review standard JavaScript try/catch structures and design an Express middleware logger.';
        } else {
          recommendation = `Review fundamentals of ${us.skill.name} to close this skill gap.`;
        }

        gaps.push({
          skillName: us.skill.name,
          level: us.level,
          score: us.score,
          severity,
          evidence,
          recommendation
        });
      }
    }

    return gaps;
  }
}
