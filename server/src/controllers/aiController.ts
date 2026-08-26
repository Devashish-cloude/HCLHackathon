import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIService, ChatContext } from '../services/aiService';

const prisma = new PrismaClient();

export class AIController {
  static async listConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const conversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      return res.json({ success: true, conversations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const conversation = await prisma.conversation.findUnique({
        where: { id, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      return res.json({ success: true, conversation });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { title } = req.body;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title || 'New Chat Session'
        }
      });

      return res.status(201).json({ success: true, conversation });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await prisma.conversation.delete({
        where: { id, userId }
      });

      return res.json({ success: true, message: 'Conversation deleted' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async chat(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { message, conversationId } = req.body;

      if (!userId || !message) {
        return res.status(400).json({ success: false, message: 'Message text is required' });
      }

      // 1. Get or create conversation
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        // Auto extract brief title from user message
        const title = message.length > 30 ? message.substring(0, 27) + '...' : message;
        const newConv = await prisma.conversation.create({
          data: { userId, title }
        });
        activeConversationId = newConv.id;
      }

      // 2. Fetch conversation history
      const historyMessages = await prisma.message.findMany({
        where: { conversationId: activeConversationId },
        orderBy: { createdAt: 'asc' }
      });

      // Save user message to database
      const userMsg = await prisma.message.create({
        data: {
          conversationId: activeConversationId,
          role: 'user',
          content: message
        }
      });

      // 3. Assemble User/Learner Context for the AI Prompt
      const profile = await prisma.profile.findUnique({ where: { userId } });
      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true }
      });
      const learningPath = await prisma.learningPath.findUnique({
        where: { userId },
        include: { items: { orderBy: { order: 'asc' } } }
      });

      const currentPathItem = learningPath?.items.find(item => item.status === 'InProgress')?.title;
      const weakSkills = userSkills.filter(s => s.score < 70).map(s => s.skill.name);

      const chatContext: ChatContext = {
        careerGoal: profile?.careerGoal || 'Full Stack Web Development',
        currentPathItem,
        skills: userSkills.map(us => ({ name: us.skill.name, score: us.score })),
        weakAreas: weakSkills
      };

      // 4. Request response from AI service
      const history = historyMessages.map(m => ({ role: m.role, content: m.content }));
      const botResponse = await AIService.generateChatResponse(message, history, chatContext);

      // Save bot response to database
      const assistantMsg = await prisma.message.create({
        data: {
          conversationId: activeConversationId,
          role: 'assistant',
          content: botResponse
        }
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: activeConversationId },
        data: { updatedAt: new Date() }
      });

      return res.json({
        success: true,
        conversationId: activeConversationId,
        userMessage: userMsg,
        aiResponse: assistantMsg
      });

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
