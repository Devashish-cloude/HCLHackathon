# LearnPath AI — Personalized Learning Platform

LearnPath AI is a production-quality, fully functional full-stack web application that generates personalized learning roadmaps based on a user's career goals, interests, current skills, and ongoing assessment performance. The platform dynamically adapts the curriculum timeline to help students master critical skills and close detected gaps.

---

## 🚀 Key Features

1. **Multi-Step Onboarding**: Collects student role, experience level, custom career goal, and style preferences.
2. **AI Dynamic Learning Path Generator**: Returns structured JSON phases (Foundation, Core Skills, Frameworks, Capstones) dynamically generated for the learner's goal.
3. **Good Morning Dashboard**:
   - *Continue Learning Card*: Tracks current course and active modules.
   - *Today's Focus*: A DB-backed checklist that increments learning streaks when completed.
   - *Roadmap Timeline Nodes*: Renders checkmarks (Completed), circles (InProgress), and locks (Locked) matching the roadmap status.
4. **Adaptive Grading Engine**: Evaluates assessment submissions. Scores $<60\%$ trigger critical skill gap warnings and recommend review lessons. Scores $>85\%$ automatically unlock advanced modules.
5. **Context-Aware AI Mentor**: An interactive tutor chat that remembers your career goals, active modules, and weak areas. Features markdown rendering, code block formats, and a one-click copy code utility.
6. **Competency Skill Analysis**: Visually maps out skill scores and highlights Critical/Moderate gap areas with actionable evidence statements.
7. **Progress Analytics**: Uses vector Recharts visualizations to graph weekly study minutes and line-rate skill growths.
8. **Explore Directory**: Searchable index of all active courses with duration, difficulty filters, and path enrollments.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TypeScript, React Router, Tailwind CSS, Lucide React, TanStack Query, React Hook Form, Zod, Recharts
- **Backend**: Node.js, Express.js, TypeScript, REST API
- **Database & ORM**: PostgreSQL with Prisma ORM

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (and copy it inside `server/.env`):

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/learnpath_ai?schema=public"
JWT_SECRET="local-dev-access-token-secret-12345"
JWT_REFRESH_SECRET="local-dev-refresh-token-secret-12345"
OPENAI_API_KEY="your-openai-api-key"
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:5000"
PORT=5000
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** running locally on port 5432

### 2. Install Dependencies
Run from the root directory to install root, client, and server dependencies:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Database Setup (Migrations & Seed)
Before running the database scripts, make sure a PostgreSQL database named `learnpath_ai` exists:
```bash
# Run migrations to create tables
npm run db:migrate

# Seed database with courses, modules, lessons, and the demo user
npm run db:seed
```

### 4. Run Development Servers
Start the backend Express server (on port `5000`) and the Vite client app (on port `5173`) concurrently:
```bash
npm run dev
```

---

## 🔑 Demo Credentials

To test the application on first launch, use our pre-seeded development profile:
- **Email**: `demo@learnpath.ai`
- **Password**: `Demo@123`

*Note: This profile comes pre-populated with 14 days learning streak, 38 hours of study time, and 42% progress on the Asynchronous JavaScript course.*
