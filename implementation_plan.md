# LearnPath AI Implementation Plan

LearnPath AI is an AI-powered personalized learning platform. This document outlines the proposed full-stack architecture, folder structure, database schema, API design, and UI flow details to build this application.

## User Review Required

> [!IMPORTANT]
> - **PostgreSQL Database**: We will use PostgreSQL as the primary database. The user can start a local PostgreSQL container using `docker compose up -d`.
> - **OpenAI API Key**: The server will integrate with OpenAI (`gpt-4o` or similar model) to dynamically generate learning paths, assessments, customized recommendations, and power the interactive AI Mentor. If `OPENAI_API_KEY` is not provided, the server will fall back to a rule-based mock engine that generates structured paths, assessment outcomes, and simulated chat responses to ensure the app is fully functional out-of-the-box.
> - **Tailwind CSS**: The frontend will use Tailwind CSS v3 or v4 (standard React+Vite configuration) to replicate the professional blue dashboard aesthetics.

---

## Proposed Changes

We will create a monorepo setup:
1. `server/` (Express.js, TypeScript, Prisma ORM, JWT, Bcrypt, OpenAI SDK)
2. `client/` (React, Vite, TypeScript, Tailwind CSS, Lucide icons, TanStack Query, Recharts, React Router)
3. Root files (`package.json`, `.env.example`, `docker-compose.yml`, `README.md`)

---

### Database Schema (Prisma)

The Prisma schema will map the following relational models:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum TaskType {
  LESSON
  PRACTICE
  REVIEW
  ASSESSMENT
}

enum RecommendationType {
  COURSE
  MODULE
  PROJECT
  EXERCISE
  ASSESSMENT
}

enum AssessmentType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  CODING
  SHORT_ANSWER
}

model User {
  id                 String              @id @default(uuid())
  email              String              @unique
  passwordHash       String
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  role               Role                @default(USER)
  profile            Profile?
  userSkills         UserSkill[]
  userProgress       UserProgress[]
  attempts           AssessmentAttempt[]
  recommendations    Recommendation[]
  conversations      Conversation[]
  dailyTasks         DailyTask[]
  notifications      Notification[]
  learningSessions   LearningSession[]
  learningPath       LearningPath?
}

model Profile {
  id                    String      @id @default(uuid())
  userId                String      @unique
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name                  String
  currentRole           String
  experienceLevel       String
  careerGoal            String
  interests             String[]
  hoursPerDay           Float       @default(1.0)
  preferredLearningStyle String     @default("Coding")
  goalStatement         String
  onboardingCompleted   Boolean     @default(false)
  avatarUrl             String?
  streak                Int         @default(0)
  lastActive            DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

model Skill {
  id          String      @id @default(uuid())
  name        String      @unique
  category    String
  description String
  userSkills  UserSkill[]
}

model UserSkill {
  id        String     @id @default(uuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  skillId   String
  skill     Skill      @relation(fields: [skillId], references: [id], onDelete: Cascade)
  level     SkillLevel @default(BEGINNER)
  score     Int        @default(0) // 0-100 proficiency score
  updatedAt DateTime   @updatedAt

  @@unique([userId, skillId])
}

model Course {
  id          String              @id @default(uuid())
  title       String              @unique
  description String
  difficulty  String
  duration    String              // e.g. "12h"
  rating      Float               @default(4.5)
  imageUrl    String?
  tags        String[]
  modules     Module[]
}

model Module {
  id          String              @id @default(uuid())
  courseId    String
  course      Course              @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title       String
  description String
  order       Int
  lessons     Lesson[]
  learningItems LearningPathItem[]
}

model Lesson {
  id            String         @id @default(uuid())
  moduleId      String
  module        Module         @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  title         String
  description   String
  content       String         @db.Text // Markdown text
  duration      Int            // minutes
  order         Int
  videoUrl      String?
  codeExample   String?        @db.Text
  codingExercise String?       @db.Text
  quizQuestions Json?          // JSON format questions [{question, type, options, correctAnswer}]
  userProgress  UserProgress[]
}

model LearningPath {
  id                String             @id @default(uuid())
  userId            String             @unique
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal              String
  estimatedDuration String
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  items             LearningPathItem[]
}

model LearningPathItem {
  id             String       @id @default(uuid())
  learningPathId String
  learningPath   LearningPath @relation(fields: [learningPathId], references: [id], onDelete: Cascade)
  phaseTitle     String       // Foundation, Core Skills, etc.
  moduleId       String?      // Links to static module if matched
  module         Module?      @relation(fields: [moduleId], references: [id], onDelete: SetNull)
  title          String       // Generates name (could be custom AI name)
  description    String
  order          Int
  status         String       @default("Locked") // "Locked" | "Available" | "InProgress" | "Completed"
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model UserProgress {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId    String
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  completed   Boolean   @default(false)
  score       Int?      // Score if completed a quiz/coding challenge
  completedAt DateTime? @default(now())

  @@unique([userId, lessonId])
}

model Assessment {
  id          String              @id @default(uuid())
  title       String
  description String
  type        AssessmentType      @default(MULTIPLE_CHOICE)
  duration    Int                 // minutes
  questions   Question[]
  attempts    AssessmentAttempt[]
}

model Question {
  id           String     @id @default(uuid())
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  questionText String
  type         String     // MC, TF, CODING, SHORT
  options      Json?      // choices array for MC
  correctAnswer String
  points       Int        @default(10)
}

model AssessmentAttempt {
  id           String     @id @default(uuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  score        Int
  maxScore     Int
  passed       Boolean
  completedAt  DateTime   @default(now())
  answers      Json       // user's answers mapped to questionId
  feedback     Json?      // AI feedback details
}

model Recommendation {
  id          String             @id @default(uuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String
  type        RecommendationType
  targetId    String             // Course ID, module ID, assessment ID, etc.
  explanation String             // Why recommended?
  clicked     Boolean            @default(false)
  createdAt   DateTime           @default(now())
}

model Conversation {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" | "assistant"
  content        String       @db.Text
  createdAt      DateTime     @default(now())
}

model DailyTask {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskText    String
  taskType    TaskType  @default(LESSON)
  estimatedTime String  // e.g. "15 min"
  completed   Boolean   @default(false)
  date        DateTime  @default(now())
  completedAt DateTime?
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      String   // RECOMMENDATION, STREAK, REMINDER, COMPLETION, ASSESSMENT
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model LearningSession {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  durationMinutes Int
  date            DateTime @default(now())
}
```

---

### Backend Service Components

1. **AI Service (`server/src/services/aiService.ts`)**:
   - Manages communication with OpenAI API.
   - Fallback responses if API key is not present.
   - Generates structured JSON roadmaps.
   - Context injection: loads user's profile, assessment performance, and active path items to construct custom assistant system prompts.

2. **Adaptive Engine (`server/src/services/recommendationService.ts`)**:
   - Assesses assessment results.
   - If score is $<60\%$, automatically creates custom recommendations/tasks focusing on that skill and flag items as priority.
   - Unlocks next phases or suggests skipping when performance is $>85\%$.

3. **Authentication (`server/src/middleware/authMiddleware.ts` & `server/src/controllers/authController.ts`)**:
   - Signup + onboarding steps.
   - Login + JWT generation.
   - Access tokens (15m expiry) and Refresh tokens (7d HTTP-only cookies/storage).

---

### Frontend Pages & Navigation

1. **Authentication Shell**: `/login`, `/signup`, `/forgot-password`, `/reset-password/:token`
2. **Onboarding Drawer**: Multi-step wizard `/onboarding` that locks the profile creation.
3. **Core Dashboard**: Sidebar navigation containing:
   - **Dashboard** (`/dashboard`): Continue learning card, Today's Focus checklist (db-backed), visual roadmap path overview, progress statistics, and recommendations.
   - **Learning Path** (`/learning-path`): Custom phase-based tree rendering, interactive continue buttons.
   - **Skill Analysis** (`/skill-analysis`): Proficiency bars, identified gap areas (critical vs moderate), recommendations list.
   - **AI Mentor** (`/ai-mentor`): Modern chat shell with dynamic sidebar for history, loading typing states, markdown/syntax-highlighted code components, context-aware personalized tutor response.
   - **Explore** (`/explore`): Debounced search index over all available courses, filtering, adding courses directly to path.
   - **Progress** (`/progress`): Recharts charts for weekly activity, skill growth metrics, and course completions.
   - **Assessments** (`/assessments` and `/assessments/:id`): Real test layout with timer, multi-question components, and score evaluation displaying skill gaps and adjustments.
   - **Profile & Settings** (`/profile` & `/settings`): Full capability to configure profile, difficulty preferences, dark/light theme options, and details.

---

## Verification Plan

### Automated Verification
- We will add standard Unit Tests (`npm test` in server/client) for JWT validation, AI response serialization, and signup validation schema.

### Manual Verification
- Run server and client concurrently using `npm run dev` in workspace root.
- Validate multi-step onboarding flow writes data to Postgres.
- Test check-in of Daily Tasks updates DB.
- Take an assessment, fail deliberately, verify that the dashboard recommends prerequisites, and see skill metrics drop.
- Retake, pass, verify that new path items unlock.
- Initiate dynamic chats with the AI Mentor, testing the personalized context feature.
