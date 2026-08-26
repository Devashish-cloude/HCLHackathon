import { Request, Response } from 'express';
import { PrismaClient, SkillLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AIService } from '../services/aiService';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-access-token-secret-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'local-dev-refresh-token-secret-12345';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      // Check user existence
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'USER'
        }
      });

      // Generate Access Token
      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      // In production, write refresh token to HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        accessToken,
        refreshToken, // Fallback for clients not using cookies
        user: { id: user.id, email: user.email }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate tokens
      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Update last active
      if (user.profile) {
        await prisma.profile.update({
          where: { userId: user.id },
          data: { lastActive: new Date() }
        });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          onboardingCompleted: user.profile?.onboardingCompleted || false,
          name: user.profile?.name || ''
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out successfully' });
  }

  static async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Refresh token not found' });
      }

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
      return res.json({ success: true, accessToken });
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  }

  static async saveOnboarding(req: Request & { userId?: string }, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { name, currentRole, experienceLevel, careerGoal, interests, hoursPerDay, preferredLearningStyle, goalStatement, skills } = req.body;

      // 1. Create/Update user Profile
      const profile = await prisma.profile.upsert({
        where: { userId },
        update: {
          name,
          currentRole,
          experienceLevel,
          careerGoal,
          interests,
          hoursPerDay: parseFloat(hoursPerDay) || 1.0,
          preferredLearningStyle,
          goalStatement,
          onboardingCompleted: true,
          lastActive: new Date()
        },
        create: {
          userId,
          name,
          currentRole,
          experienceLevel,
          careerGoal,
          interests,
          hoursPerDay: parseFloat(hoursPerDay) || 1.0,
          preferredLearningStyle,
          goalStatement,
          onboardingCompleted: true,
          lastActive: new Date()
        }
      });

      // 2. Save user skill preferences from Onboarding
      if (skills && Array.isArray(skills)) {
        for (const sk of skills) {
          const dbSkill = await prisma.skill.findFirst({
            where: { name: { equals: sk.name, mode: 'insensitive' } }
          });
          if (dbSkill) {
            let score = 30;
            let level: SkillLevel = SkillLevel.BEGINNER;
            if (sk.level === 'Intermediate') {
              score = 60;
              level = SkillLevel.INTERMEDIATE;
            } else if (sk.level === 'Advanced') {
              score = 85;
              level = SkillLevel.ADVANCED;
            }

            await prisma.userSkill.upsert({
              where: { userId_skillId: { userId, skillId: dbSkill.id } },
              update: { score, level },
              create: { userId, skillId: dbSkill.id, score, level }
            });
          }
        }
      }

      // 3. Generate Learning Path using AIService
      const onboardingData = {
        name,
        currentRole,
        experienceLevel,
        careerGoal,
        interests,
        hoursPerDay: parseFloat(hoursPerDay) || 1.0,
        preferredLearningStyle,
        goalStatement
      };

      const pathData = await AIService.generateLearningPath(onboardingData);

      // Save generated path items to DB
      const existingPath = await prisma.learningPath.findUnique({ where: { userId } });
      if (existingPath) {
        await prisma.learningPathItem.deleteMany({ where: { learningPathId: existingPath.id } });
        await prisma.learningPath.delete({ where: { id: existingPath.id } });
      }

      const newPath = await prisma.learningPath.create({
        data: {
          userId,
          goal: pathData.goal || careerGoal,
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
              status: orderIdx === 2 ? 'Available' : 'Locked', // Make the first one available
              moduleId: matchedModule?.id || null
            }
          });
        }
      }

      // 4. Create standard recommendations and daily tasks
      await prisma.dailyTask.create({
        data: {
          userId,
          taskText: `Start your first lesson in ${pathData.phases[0]?.modules[0]?.title || 'Fundamentals'}`,
          taskType: 'LESSON',
          estimatedTime: '15 min'
        }
      });

      return res.json({
        success: true,
        message: 'Onboarding completed and learning path generated successfully',
        profile
      });

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ success: false, message: 'No user registered with this email' });
      }

      // Generate simulation token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      // Simulated email link response
      return res.json({
        success: true,
        message: 'Password reset link sent to your email (simulated)',
        resetLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash }
      });

      return res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
  }
}
