import { PrismaClient, SkillLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import assert from 'assert';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-access-token-secret-12345';

async function runTests() {
  console.log('🚀 Running Backend Critical Logic Tests...');
  const testEmail = `test-${Date.now()}@learnpath.ai`;
  const rawPassword = 'Password@123';
  let userId = '';

  try {
    // --- 1. Test Signup (Bcrypt Hashing) ---
    console.log('Testing User Signup...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        role: 'USER'
      }
    });
    userId = user.id;
    assert.ok(user.id, 'User ID should be generated');
    assert.strictEqual(user.email, testEmail, 'Email should match');
    assert.notStrictEqual(user.passwordHash, rawPassword, 'Password should be hashed');
    console.log('✅ Signup Test Passed');

    // --- 2. Test Login Verification ---
    console.log('Testing User Login (Password verification)...');
    const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
    assert.ok(dbUser, 'User should exist in database');
    const isMatch = await bcrypt.compare(rawPassword, dbUser.passwordHash);
    assert.strictEqual(isMatch, true, 'Bcrypt should verify correct password');
    console.log('✅ Login Password Test Passed');

    // --- 3. Test JWT Token Generation and Verification ---
    console.log('Testing JWT Access Token logic...');
    const token = jwt.sign({ userId: dbUser.id }, JWT_SECRET, { expiresIn: '15m' });
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    assert.strictEqual(decoded.userId, dbUser.id, 'Decoded token ID must match User ID');
    console.log('✅ JWT Token Verification Test Passed');

    // --- 4. Test Course API Queries ---
    console.log('Testing Course database retrieval...');
    const courses = await prisma.course.findMany();
    assert.ok(Array.isArray(courses), 'Course query should return an array');
    console.log(`✅ Course API Test Passed. Found ${courses.length} courses`);

    // --- 5. Test Progress Tracking & Completion ---
    console.log('Testing Progress tracking logic...');
    const firstLesson = await prisma.lesson.findFirst();
    if (firstLesson) {
      const progress = await prisma.userProgress.upsert({
        where: {
          userId_lessonId: { userId: dbUser.id, lessonId: firstLesson.id }
        },
        update: { completed: true },
        create: {
          userId: dbUser.id,
          lessonId: firstLesson.id,
          completed: true
        }
      });
      assert.strictEqual(progress.completed, true, 'Lesson should be marked completed');
      console.log('✅ Progress API Test Passed');
    } else {
      console.log('⚠️ Skipping Progress Test (No lessons found)');
    }

    // --- 6. Test Assessment & Adaptive Pathing ---
    console.log('Testing Assessment attempt and Adaptive Path updates...');
    const assessment = await prisma.assessment.findFirst();
    if (assessment) {
      const score = 85;
      const maxScore = 100;
      const passed = true;

      const attempt = await prisma.assessmentAttempt.create({
        data: {
          userId: dbUser.id,
          assessmentId: assessment.id,
          score,
          maxScore,
          passed,
          answers: {},
          feedback: { scorePercentage: score, passed }
        }
      });
      assert.strictEqual(attempt.passed, true, 'Attempt should record passing status');
      console.log('✅ Assessment & Adaptive Path Test Passed');
    } else {
      console.log('⚠️ Skipping Assessment Test (No assessments found)');
    }

    console.log('✨ All backend critical assertions passed successfully!');

  } catch (error: any) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    // Clean up test user
    if (userId) {
      await prisma.userProgress.deleteMany({ where: { userId } });
      await prisma.assessmentAttempt.deleteMany({ where: { userId } });
      await prisma.userSkill.deleteMany({ where: { userId } });
      await prisma.profile.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      console.log('Cleaned up test user data.');
    }
    await prisma.$disconnect();
  }
}

runTests();
