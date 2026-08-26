import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { UserController } from '../controllers/userController';
import { PathController } from '../controllers/pathController';
import { CourseController } from '../controllers/courseController';
import { ProgressController } from '../controllers/progressController';
import { SkillController } from '../controllers/skillController';
import { AssessmentController } from '../controllers/assessmentController';
import { AIController } from '../controllers/aiController';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/signup', AuthController.signup);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/refresh', AuthController.refresh);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.post('/auth/onboarding', authMiddleware, AuthController.saveOnboarding);

// --- User Profile & Dashboard Routes ---
router.get('/users/me', authMiddleware, UserController.getProfile);
router.put('/users/me', authMiddleware, UserController.updateProfile);
router.get('/dashboard', authMiddleware, UserController.getDashboard);
router.post('/dashboard/complete-task', authMiddleware, UserController.completeDailyTask);

// --- Learning Path Routes ---
router.get('/learning-path', authMiddleware, PathController.getPath);
router.post('/learning-path/generate', authMiddleware, PathController.generatePath);

// --- Course Routes ---
router.get('/courses', CourseController.listCourses);
router.get('/courses/:id', authMiddleware, CourseController.getCourse);
router.post('/courses/:id/enroll', authMiddleware, CourseController.enroll);

// --- Progress Routes ---
router.post('/progress', authMiddleware, ProgressController.completeLesson);

// --- Skill Routes ---
router.get('/skills', authMiddleware, SkillController.listSkills);
router.get('/skills/analysis', authMiddleware, SkillController.getAnalysis);

// --- Assessment Routes ---
router.get('/assessments', authMiddleware, AssessmentController.listAssessments);
router.get('/assessments/:id', authMiddleware, AssessmentController.getAssessment);
router.post('/assessments/:id/submit', authMiddleware, AssessmentController.submitAssessment);

// --- AI Chat / Mentor Routes ---
router.get('/conversations', authMiddleware, AIController.listConversations);
router.post('/conversations', authMiddleware, AIController.createConversation);
router.get('/conversations/:id', authMiddleware, AIController.getConversation);
router.delete('/conversations/:id', authMiddleware, AIController.deleteConversation);
router.post('/ai/chat', authMiddleware, AIController.chat);

// --- Notification Routes ---
router.get('/notifications', authMiddleware, NotificationController.listNotifications);
router.put('/notifications/:id/read', authMiddleware, NotificationController.markRead);

export default router;
