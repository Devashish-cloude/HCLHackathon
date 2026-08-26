import { PrismaClient, SkillLevel, TaskType, RecommendationType, AssessmentType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.learningSession.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.dailyTask.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.learningPathItem.deleteMany({});
  await prisma.learningPath.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Skills
  const skillsData = [
    { name: 'JS Fundamentals', category: 'JavaScript', description: 'Variables, loops, operators, and basic logic' },
    { name: 'DOM Manipulation', category: 'Frontend', description: 'Selecting, modifying, and updating HTML elements in browser' },
    { name: 'ES6+ Features', category: 'JavaScript', description: 'Arrow functions, destructuring, rest/spread, classes' },
    { name: 'Data Structures', category: 'Computer Science', description: 'Arrays, Objects, Sets, Maps, stacks, and queues' },
    { name: 'Async Programming', category: 'JavaScript', description: 'Callbacks, Promises, async/await, and Event Loop' },
    { name: 'API Integration', category: 'Backend', description: 'REST APIs, fetch, JSON serialization, and response parsing' },
    { name: 'Error Handling', category: 'Software Engineering', description: 'Try/catch blocks, error logging, and custom exception boundaries' },
    { name: 'React Fundamentals', category: 'React', description: 'Components, props, state, hooks, and lifecycle' },
    { name: 'HTML/CSS Basics', category: 'Frontend', description: 'Semantic markup, CSS box model, flexbox, grid, responsive styles' },
    { name: 'TypeScript Core', category: 'TypeScript', description: 'Types, interfaces, generics, and compiler options' },
    { name: 'REST APIs', category: 'Backend', description: 'HTTP verbs, routes, parameters, status codes' },
    { name: 'Database SQL & ORMs', category: 'Database', description: 'SQL commands, Prisma ORM, relations, migrations' },
  ];

  const skills: Record<string, any> = {};
  for (const sk of skillsData) {
    skills[sk.name] = await prisma.skill.create({ data: sk });
  }

  // 3. Create Courses
  // Course 1: JavaScript Basics (completed)
  const courseJS = await prisma.course.create({
    data: {
      title: 'JavaScript Basics & Fundamentals',
      description: 'Master variables, core data types, conditional logic, loops, and basic arithmetic structures in Javascript.',
      difficulty: 'Beginner',
      duration: '8h',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=300&auto=format&fit=crop',
      tags: ['JavaScript', 'Programming', 'Foundations'],
    }
  });

  // Course 2: DOM Manipulation & Browser API (completed)
  const courseDOM = await prisma.course.create({
    data: {
      title: 'DOM Manipulation & Dynamic Websites',
      description: 'Interact dynamically with web browsers. Learn selectors, event listeners, document traversal, and stylesheet editing.',
      difficulty: 'Beginner',
      duration: '10h',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=300&auto=format&fit=crop',
      tags: ['Frontend', 'DOM', 'HTML/CSS'],
    }
  });

  // Course 3: ES6+ Features (completed)
  const courseES6 = await prisma.course.create({
    data: {
      title: 'Modern Javascript: ES6+ Deep Dive',
      description: 'Learn modern specifications. Arrow functions, destructuring, modules, arrays methods, class context, and templates.',
      difficulty: 'Intermediate',
      duration: '6h',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=300&auto=format&fit=crop',
      tags: ['JavaScript', 'ES6', 'Coding'],
    }
  });

  // Course 4: JavaScript Async Programming (in-progress)
  const courseAsync = await prisma.course.create({
    data: {
      title: 'JavaScript Async Programming',
      description: 'Master Promises, async/await, and event loops to handle complex data fetching and UI updates.',
      difficulty: 'Intermediate',
      duration: '12h',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop',
      tags: ['JavaScript', 'Async', 'Event Loop'],
    }
  });

  // Course 5: APIs & Fetch (recommendation target)
  const courseAPI = await prisma.course.create({
    data: {
      title: 'APIs & Fetch',
      description: 'Connect frontends to database APIs. Master HTTP codes, authentication tokens, payload requests, and JSON conversions.',
      difficulty: 'Intermediate',
      duration: '10h',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=300&auto=format&fit=crop',
      tags: ['APIs', 'Fetch', 'Integration'],
    }
  });

  // Course 6: Advanced React State Management
  const courseReactAdv = await prisma.course.create({
    data: {
      title: 'Advanced React State Management',
      description: 'Master Redux, Zustand, Context API, and state machines to design highly performant React applications.',
      difficulty: 'Advanced',
      duration: '14h',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop',
      tags: ['React', 'Zustand', 'Advanced'],
    }
  });

  // Course 9: React Foundations
  const courseReact = await prisma.course.create({
    data: {
      title: 'React Foundations',
      description: 'Learn the core patterns of React. Build responsive UIs using components, props, hooks, and state.',
      difficulty: 'Beginner',
      duration: '10h',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop',
      tags: ['React', 'Frontend', 'Components'],
    }
  });

  // Course 7: Node.js Backend Patterns & Security
  const courseNodePatterns = await prisma.course.create({
    data: {
      title: 'Node.js Backend Patterns & Security',
      description: 'Design robust server architectures. Master rate-limiting, CORS, input sanitation, session hashing, and clean architectures.',
      difficulty: 'Advanced',
      duration: '16h',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=300&auto=format&fit=crop',
      tags: ['Node.js', 'Express', 'Security'],
    }
  });

  // Course 8: SQL Database Design & Prisma ORM
  const courseSQLPrisma = await prisma.course.create({
    data: {
      title: 'SQL Database Design & Prisma ORM',
      description: 'Structure relational databases correctly. Master primary keys, indexing, table normalization, and Prisma migrations.',
      difficulty: 'Intermediate',
      duration: '10h',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=300&auto=format&fit=crop',
      tags: ['Database', 'SQL', 'Prisma'],
    }
  });

  // Course 10: Full Stack Capstone Project
  const courseCapstone = await prisma.course.create({
    data: {
      title: 'Full Stack Capstone Project',
      description: 'Build, secure, and deploy a complete full-stack web application incorporating advanced databases, user auth, and real-time APIs.',
      difficulty: 'Advanced',
      duration: '40h',
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=300&auto=format&fit=crop',
      tags: ['Capstone', 'FullStack', 'Advanced'],
    }
  });

  // 4. Create Modules and Lessons
  // Modules for CourseJS
  const mJS1 = await prisma.module.create({
    data: { courseId: courseJS.id, title: 'Variables & Data Types', description: 'Declaring strings, numbers, booleans, null/undefined', order: 1 }
  });
  const mJS2 = await prisma.module.create({
    data: { courseId: courseJS.id, title: 'Control Flow & Loops', description: 'If-else statements, for loops, while statements', order: 2 }
  });

  const lJS1 = await prisma.lesson.create({
    data: {
      moduleId: mJS1.id,
      title: 'Understanding var, let, and const',
      description: 'Differences in scopes and re-assignment properties.',
      content: 'JavaScript allows you to declare variables using `var`, `let`, or `const`.\n\n### Scoping\n- `var` is function-scoped.\n- `let` and `const` are block-scoped.\n\n```js\nlet x = 10;\nx = 20; // Allowed\n\nconst y = 30;\ny = 40; // Error!\n```',
      duration: 10,
      order: 1,
      quizQuestions: [
        {
          question: 'Which keyword allows variable redeclaration in the same scope?',
          type: 'mc',
          options: ['const', 'let', 'var', 'none'],
          correctAnswer: 'var'
        }
      ]
    }
  });

  const lJS2 = await prisma.lesson.create({
    data: {
      moduleId: mJS2.id,
      title: 'For Loops vs While Loops',
      description: 'How to iterate arrays and check repeating criteria.',
      content: 'Learn how to loop over data.\n\n```js\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n```',
      duration: 15,
      order: 1,
    }
  });

  // Modules for CourseDOM
  const mDOM1 = await prisma.module.create({
    data: { courseId: courseDOM.id, title: 'DOM Querying', description: 'Using document.querySelector and querySelectorAll', order: 1 }
  });
  const lDOM1 = await prisma.lesson.create({
    data: {
      moduleId: mDOM1.id,
      title: 'Selecting DOM elements',
      description: 'Learn css style target queries.',
      content: 'Query elements like this:\n\n```js\nconst element = document.querySelector("#title");\n```',
      duration: 15,
      order: 1
    }
  });

  // Modules for CourseES6
  const mES6_1 = await prisma.module.create({
    data: { courseId: courseES6.id, title: 'Destructuring & Spread', description: 'Extracting key attributes safely', order: 1 }
  });
  const lES6_1 = await prisma.lesson.create({
    data: {
      moduleId: mES6_1.id,
      title: 'Array and Object Destructuring',
      description: 'Learn array extraction shortcuts.',
      content: 'Destructure arrays easily:\n\n```js\nconst [first, second] = [10, 20];\n```',
      duration: 12,
      order: 1
    }
  });

  // Modules for CourseAsync
  const mAsync1 = await prisma.module.create({
    data: { courseId: courseAsync.id, title: 'Callbacks & Event Loop', description: 'Understanding how single-threaded engine works', order: 1 }
  });
  const mAsync2 = await prisma.module.create({
    data: { courseId: courseAsync.id, title: 'Promises in depth', description: 'Creating, resolving, rejecting, and chaining Promises', order: 2 }
  });
  const mAsync3 = await prisma.module.create({
    data: { courseId: courseAsync.id, title: 'Async/Await syntax', description: 'Writing synchronous looking asynchronous workflows', order: 3 }
  });

  const lAsync1 = await prisma.lesson.create({
    data: {
      moduleId: mAsync1.id,
      title: 'Understanding Callbacks',
      description: 'Passing functions as parameters to manage timings.',
      content: 'Callbacks are functions passed into other functions to run once a process completes.\n\n```js\nfunction loadData(callback) {\n  setTimeout(() => {\n    callback("Data loaded!");\n  }, 1000);\n}\n```',
      duration: 15,
      order: 1
    }
  });

  const lAsync2 = await prisma.lesson.create({
    data: {
      moduleId: mAsync2.id,
      title: 'Promises Chains',
      description: 'Chaining resolve actions using then/catch.',
      content: 'A Promise represents a future asynchronous completion status.\n\n```js\nfetchData()\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```',
      duration: 20,
      order: 1
    }
  });

  const lAsync3 = await prisma.lesson.create({
    data: {
      moduleId: mAsync3.id,
      title: 'Async/Await Syntax',
      description: 'Learn try/catch layouts wrapping async tasks.',
      content: 'Use `async` and `await` keywords:\n\n```js\nasync function run() {\n  try {\n    const response = await fetch("https://api.example.com/data");\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error(error);\n  }\n}\n```',
      duration: 15,
      order: 1,
      quizQuestions: [
        {
          question: 'What keyword goes inside async functions to wait for promises?',
          type: 'mc',
          options: ['wait', 'await', 'promise', 'then'],
          correctAnswer: 'await'
        }
      ]
    }
  });

  // Modules and Lessons for CourseAPI ("APIs & Fetch")
  const mAPI1 = await prisma.module.create({
    data: { courseId: courseAPI.id, title: 'Introduction to HTTP', description: 'HTTP verbs, status codes, headers, and payloads', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mAPI1.id,
      title: 'Understanding GET and POST requests',
      description: 'How data transfers across the web client.',
      content: 'HTTP GET is for fetching resources, whereas POST is for sending payloads.\n\n```js\nfetch("https://api.example.com/data", {\n  method: "POST",\n  body: JSON.stringify({ item: "value" })\n});\n```',
      duration: 15,
      order: 1
    }
  });

  // Modules and Lessons for CourseReact ("React Foundations")
  const mReact1 = await prisma.module.create({
    data: { courseId: courseReact.id, title: 'Components & JSX', description: 'Learn how to write component elements using JSX.', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mReact1.id,
      title: 'React Functional Components',
      description: 'Creating reusable functional items.',
      content: 'A React component is a JavaScript function that returns JSX.\n\n```jsx\nfunction Button() {\n  return <button>Click me</button>;\n}\n```',
      duration: 10,
      order: 1
    }
  });

  // Modules and Lessons for React Advanced State Management
  const mReactAdv1 = await prisma.module.create({
    data: { courseId: courseReactAdv.id, title: 'Zustand vs Redux Toolkit', description: 'Comparing flux state managers.', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mReactAdv1.id,
      title: 'Zustand State Store setup',
      description: 'Creating stores and selectors.',
      content: 'Zustand is a fast, lightweight state manager.\n\n### Usage\nCreate a store like this:\n\n```js\nimport { create } from "zustand";\nconst useStore = create((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 }))\n}));\n```',
      duration: 12,
      order: 1
    }
  });

  // Modules and Lessons for Node.js Backend Patterns
  const mNodePatterns1 = await prisma.module.create({
    data: { courseId: courseNodePatterns.id, title: 'API Hashing & JWT', description: 'Securing routes using json web tokens.', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mNodePatterns1.id,
      title: 'JSON Web Token expiration policies',
      description: 'Learn refresh token rotation.',
      content: 'Always issue short-lived access tokens.\n\n```js\njwt.sign({ userId }, secret, { expiresIn: "15m" });\n```',
      duration: 15,
      order: 1
    }
  });

  // Modules and Lessons for SQL Database Design
  const mSQLPrisma1 = await prisma.module.create({
    data: { courseId: courseSQLPrisma.id, title: 'Database Indexing', description: 'Adding index constraints for fast query retrieval.', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mSQLPrisma1.id,
      title: 'Prisma schema indices',
      description: 'Setting up schema indexes.',
      content: 'Define indices in your prisma model:\n\n```prisma\n@@unique([userId, skillId])\n```',
      duration: 10,
      order: 1
    }
  });

  // Modules and Lessons for CourseCapstone
  const mCapstone1 = await prisma.module.create({
    data: { courseId: courseCapstone.id, title: 'Capstone Implementation', description: 'Step-by-step project design and submission guidelines.', order: 1 }
  });
  await prisma.lesson.create({
    data: {
      moduleId: mCapstone1.id,
      title: 'Capstone Project Briefing & Submission',
      description: 'Read the requirements and submit your GitHub/Live URLs.',
      content: `## Capstone Project: Personal Learning Hub

Your capstone objective is to build **LearnPath AI** (or a similar AI-driven workspace) from scratch.

### 📋 Technical Requirements
1. **Database Layer**: A relational schema in PostgreSQL containing at least 6 connected tables (users, courses, progress tracking, analytics).
2. **Backend Services**: Node.js + Express + TypeScript API supporting JWT access/refresh token rotation, middleware validation, and AI logic fallbacks.
3. **Frontend Client**: React + Vite + TypeScript web interface featuring Recharts data graphs, responsive Tailwind layouts, and state-driven progress paths.
4. **AI Features**: An interactive chat interface that maintains context-aware prompts or provides rule-based tutoring templates.

### 🏆 Grading Rubric
- **Functionality (40%)**: Fully working auth flow, database updates, and timeline navigation.
- **Security (20%)**: Session tokens, salted password hashes, CORS constraints.
- **Code Quality (20%)**: TypeScript strict checks, clean imports, modular structures.
- **UX/Design (20%)**: Tailwind styling, glassmorphism dashboard details, responsive widgets.`,
      duration: 60,
      order: 1
    }
  });

  // 5. Create Demo User & Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Demo@123', salt);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@learnpath.ai',
      passwordHash: passwordHash,
      role: 'USER',
    }
  });

  console.log('Created Demo User ID:', demoUser.id);

  // 6. Create Profile
  await prisma.profile.create({
    data: {
      userId: demoUser.id,
      name: 'Devashish',
      currentRole: 'Student / Professional Learner',
      experienceLevel: 'Beginner',
      careerGoal: 'Frontend Engineering',
      interests: ['Web Development', 'AI', 'UI/UX'],
      hoursPerDay: 1.5,
      preferredLearningStyle: 'Coding',
      goalStatement: 'I want to become a job-ready frontend developer within 6 months.',
      onboardingCompleted: true,
      streak: 14,
      lastActive: new Date(),
    }
  });

  // 7. Seed User Skills with matching proficiency scores from the screenshot
  const skillProficiencies = [
    { skill: 'JS Fundamentals', score: 95, level: SkillLevel.ADVANCED },
    { skill: 'DOM Manipulation', score: 90, level: SkillLevel.ADVANCED },
    { skill: 'ES6+ Features', score: 85, level: SkillLevel.ADVANCED },
    { skill: 'Data Structures', score: 80, level: SkillLevel.INTERMEDIATE },
    { skill: 'Async Programming', score: 45, level: SkillLevel.BEGINNER },
    { skill: 'API Integration', score: 60, level: SkillLevel.INTERMEDIATE },
    { skill: 'Error Handling', score: 55, level: SkillLevel.BEGINNER },
    { skill: 'React Fundamentals', score: 20, level: SkillLevel.BEGINNER },
    { skill: 'HTML/CSS Basics', score: 75, level: SkillLevel.INTERMEDIATE },
    { skill: 'TypeScript Core', score: 30, level: SkillLevel.BEGINNER },
    { skill: 'REST APIs', score: 40, level: SkillLevel.BEGINNER },
    { skill: 'Database SQL & ORMs', score: 10, level: SkillLevel.BEGINNER },
  ];

  for (const sp of skillProficiencies) {
    if (skills[sp.skill]) {
      await prisma.userSkill.create({
        data: {
          userId: demoUser.id,
          skillId: skills[sp.skill].id,
          score: sp.score,
          level: sp.level,
        }
      });
    }
  }

  // 8. Create Learning Path & Items matching the screenshot
  const path = await prisma.learningPath.create({
    data: {
      userId: demoUser.id,
      goal: 'Frontend Engineering',
      estimatedDuration: '6 months',
    }
  });

  const pathItems = [
    // Phase 1
    { phaseTitle: 'Phase 1 - Foundation', title: 'JS Fundamentals', description: 'Variables, Data Types, Control Flow, and Loops.', order: 1, status: 'Completed', moduleId: mJS1.id },
    // Phase 2
    { phaseTitle: 'Phase 2 - Core Skills', title: 'DOM Manipulation', description: 'Selecting, modifying, and updating HTML elements in browser.', order: 2, status: 'Completed', moduleId: mDOM1.id },
    { phaseTitle: 'Phase 2 - Core Skills', title: 'Async Programming', description: 'Promises, Async/Await, and the event loop.', order: 3, status: 'InProgress', moduleId: mAsync2.id },
    // Phase 3
    { phaseTitle: 'Phase 3 - Architecture & Frameworks', title: 'APIs', description: 'Network requests and data handling.', order: 4, status: 'Locked', moduleId: mAPI1.id },
    { phaseTitle: 'Phase 3 - Architecture & Frameworks', title: 'React', description: 'Components, State, and Props.', order: 5, status: 'Locked', moduleId: mReact1.id },
    // Phase 4
    { phaseTitle: 'Phase 4 - Advanced Application', title: 'Full Stack Capstone Project', description: 'Build, deploy, and document a complete web application integrating all previous modules.', order: 6, status: 'Locked', moduleId: mCapstone1.id },
  ];

  for (const item of pathItems) {
    await prisma.learningPathItem.create({
      data: {
        learningPathId: path.id,
        phaseTitle: item.phaseTitle,
        title: item.title,
        description: item.description,
        order: item.order,
        status: item.status,
        moduleId: item.moduleId || null,
      }
    });
  }

  // 9. Create User Progress records
  // JS Basics lessons completed
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lJS1.id, completed: true, score: 100 }
  });
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lJS2.id, completed: true }
  });
  // DOM lessons completed
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lDOM1.id, completed: true }
  });
  // ES6 lessons completed
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lES6_1.id, completed: true }
  });

  // Async lessons (some incomplete)
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lAsync1.id, completed: true }
  });
  await prisma.userProgress.create({
    data: { userId: demoUser.id, lessonId: lAsync2.id, completed: false } // in-progress
  });

  // 10. Seed recommendations
  await prisma.recommendation.create({
    data: {
      userId: demoUser.id,
      title: 'APIs & Fetch',
      description: 'Connect frontends to database APIs. Master HTTP codes, authentication tokens, payload requests, and JSON conversions.',
      type: RecommendationType.COURSE,
      targetId: courseAPI.id,
      explanation: "Recommended because you're currently learning asynchronous JavaScript.",
      clicked: false,
    }
  });

  // 11. Seed Daily Tasks
  const today = new Date();
  await prisma.dailyTask.create({
    data: {
      userId: demoUser.id,
      taskText: 'Complete Async/Await lesson',
      taskType: TaskType.LESSON,
      estimatedTime: '15 min',
      completed: false,
      date: today,
    }
  });
  await prisma.dailyTask.create({
    data: {
      userId: demoUser.id,
      taskText: 'Practice 5 JavaScript questions',
      taskType: TaskType.PRACTICE,
      estimatedTime: '20 min',
      completed: false,
      date: today,
    }
  });
  await prisma.dailyTask.create({
    data: {
      userId: demoUser.id,
      taskText: 'Review Promises',
      taskType: TaskType.REVIEW,
      estimatedTime: '7 min',
      completed: false,
      date: today,
    }
  });

  // 12. Seed Conversation History & Chat logs
  const conv1 = await prisma.conversation.create({
    data: {
      userId: demoUser.id,
      title: 'CSS Flexbox Mastery',
      updatedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      role: 'assistant',
      content: 'Flexbox is a one-dimensional layout method for laying out items in rows or columns. Items flex to fill additional space and shrink to fit into smaller spaces.\n\nWould you like me to show you a practical example of how `justify-content` and `align-items` work together?',
      createdAt: new Date(today.getTime() - 20 * 60 * 1000)
    }
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      role: 'user',
      content: 'Yes, please! I\'m confused about the difference between centering things horizontally versus vertically.',
      createdAt: new Date(today.getTime() - 19 * 60 * 1000)
    }
  });
  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      role: 'assistant',
      content: 'I can help with that. Think of `justify-content` as controlling alignment along the **Main Axis** (usually horizontal), and `align-items` controlling alignment along the **Cross Axis** (usually vertical).',
      createdAt: new Date(today.getTime() - 18 * 60 * 1000)
    }
  });

  // Other conversations
  await prisma.conversation.create({
    data: { userId: demoUser.id, title: 'Understanding Promises', updatedAt: new Date(today.getTime() - 4 * 60 * 60 * 1000) }
  });
  await prisma.conversation.create({
    data: { userId: demoUser.id, title: 'React Hooks Deep Dive', updatedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) }
  });
  await prisma.conversation.create({
    data: { userId: demoUser.id, title: 'Algorithm Practice: Sorting', updatedAt: new Date(today.getTime() - 25 * 60 * 60 * 1000) }
  });

  // 13. Seed Assessments and Questions
  const assessment = await prisma.assessment.create({
    data: {
      title: 'JavaScript Async & Control Flow',
      description: 'Test your understanding of Javascript asynchronous logic, callbacks, promises, and loops.',
      type: AssessmentType.MULTIPLE_CHOICE,
      duration: 15,
    }
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      questionText: 'What is the value of `x` after: let x = 5; { let x = 10; }',
      type: 'mc',
      options: ['5', '10', 'undefined', 'ReferenceError'],
      correctAnswer: '5',
      points: 10
    }
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      questionText: 'Which event loop microtask finishes first?',
      type: 'mc',
      options: ['setTimeout', 'Promise.resolve().then()', 'setInterval', 'setImmediate'],
      correctAnswer: 'Promise.resolve().then()',
      points: 10
    }
  });

  await prisma.question.create({
    data: {
      assessmentId: assessment.id,
      questionText: 'What does Promise.all() do if one of the promises rejects?',
      type: 'mc',
      options: [
        'Waits for all to finish and returns successes',
        'Immediately rejects with that error',
        'Ignores the error and returns values',
        'Returns undefined'
      ],
      correctAnswer: 'Immediately rejects with that error',
      points: 10
    }
  });

  // Seed LearningSessions to populate progress graphs
  const sessions = [
    { durationMinutes: 45, date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 60, date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 30, date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 90, date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 120, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 40, date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) },
    { durationMinutes: 75, date: today },
  ];

  for (const s of sessions) {
    await prisma.learningSession.create({
      data: {
        userId: demoUser.id,
        durationMinutes: s.durationMinutes,
        date: s.date,
      }
    });
  }

  // Seed Notifications
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: 'New recommended course',
      message: 'Checkout APIs & Fetch course based on your current focus.',
      type: 'RECOMMENDATION',
      read: false,
    }
  });
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: 'Streak Milestone!',
      message: 'You have maintained a learning streak of 14 days. Keep it up!',
      type: 'STREAK',
      read: false,
    }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
