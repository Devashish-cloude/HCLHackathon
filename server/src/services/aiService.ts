import { OpenAI } from 'openai';

// Initialize OpenAI client if key is provided
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface OnboardingData {
  name: string;
  currentRole: string;
  experienceLevel: string;
  careerGoal: string;
  interests: string[];
  hoursPerDay: number;
  preferredLearningStyle: string;
  goalStatement: string;
}

export interface ChatContext {
  careerGoal: string;
  currentPathItem?: string;
  skills: { name: string; score: number }[];
  weakAreas: string[];
}

export class AIService {
  /**
   * Generates a structured personalized learning roadmap based on user onboarding choices
   */
  static async generateLearningPath(data: OnboardingData): Promise<any> {
    const prompt = `
      You are an expert curriculum developer. Generate a personalized learning roadmap for a student with the following profile:
      - Name: ${data.name}
      - Current Role: ${data.currentRole}
      - Experience Level: ${data.experienceLevel}
      - Career Goal: ${data.careerGoal}
      - Interests: ${data.interests.join(', ')}
      - Available hours/day: ${data.hoursPerDay}
      - Preferred style: ${data.preferredLearningStyle}
      - Target Goal: ${data.goalStatement}

      Generate 4 phases:
      Phase 1: Foundation
      Phase 2: Core Skills
      Phase 3: Architecture & Frameworks
      Phase 4: Advanced Application

      For each phase, generate modules with titles and descriptions. Link each module to relevant skills.
      Return the output strictly in JSON format as follows:
      {
        "goal": "${data.careerGoal}",
        "estimatedDuration": "6 months",
        "phases": [
          {
            "phaseTitle": "Phase 1 - Foundation",
            "modules": [
              { "title": "Module Title", "description": "Module Description" }
            ]
          }
        ]
      }
    `;

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });
        const content = response.choices[0].message.content;
        if (content) {
          return JSON.parse(content);
        }
      } catch (err) {
        console.error('OpenAI Error, falling back to rule-based generation:', err);
      }
    }

    // Dynamic Mock Fallback (matches the custom onboarding goal)
    return this.getMockLearningPath(data.careerGoal);
  }

  /**
   * AI chat response customized for the student's context
   */
  static async generateChatResponse(
    messageText: string,
    history: { role: string; content: string }[],
    context: ChatContext
  ): Promise<string> {
    const contextPrompt = `
      You are LearnPath AI Mentor, an expert personalized tutor.
      Here is the learner's context to tailor your responses:
      - Career Goal: ${context.careerGoal}
      - Currently Learning: ${context.currentPathItem || 'General foundations'}
      - Skills: ${context.skills.map(s => `${s.name} (${s.score}%)`).join(', ')}
      - Weak Areas: ${context.weakAreas.join(', ')}

      Always sound encouraging, refer to their learning path where appropriate, and write clean, readable code examples in markdown blocks.
    `;

    if (openai) {
      try {
        const messages = [
          { role: 'system', content: contextPrompt },
          ...history.map(h => ({ role: h.role as any, content: h.content })),
          { role: 'user', content: messageText }
        ];
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages
        });
        return response.choices[0].message.content || "I'm sorry, I could not generate a response.";
      } catch (err) {
        console.error('OpenAI Chat Error, falling back to mock response:', err);
      }
    }

    return this.getMockChatResponse(messageText, context);
  }

  private static getMockLearningPath(careerGoal: string): any {
    // Generate custom path based on goal
    const isFrontend = careerGoal.toLowerCase().includes('front') || careerGoal.toLowerCase().includes('ui') || careerGoal.toLowerCase().includes('ux');
    const isBackend = careerGoal.toLowerCase().includes('back') || careerGoal.toLowerCase().includes('cloud') || careerGoal.toLowerCase().includes('security');

    if (isBackend) {
      return {
        goal: careerGoal,
        estimatedDuration: '6 months',
        phases: [
          {
            phaseTitle: 'Phase 1 - Foundation',
            modules: [
              { title: 'Programming Fundamentals', description: 'Data structures, syntax, variables and control structures.' },
              { title: 'System Commands & CLI', description: 'Master command line bash scripting and workspace tools.' }
            ]
          },
          {
            phaseTitle: 'Phase 2 - Core Skills',
            modules: [
              { title: 'Node.js & Express Basics', description: 'Setting up web servers, custom middleware, and handling routing.' },
              { title: 'Relational Databases & SQL', description: 'Designing tables, keys, writing queries, and normalization.' }
            ]
          },
          {
            phaseTitle: 'Phase 3 - Architecture & Frameworks',
            modules: [
              { title: 'RESTful API Architecture', description: 'Building secure endpoints, query validations, and JWT tokens.' },
              { title: 'Microservices & Docker', description: 'Containerizing services and managing environment processes.' }
            ]
          },
          {
            phaseTitle: 'Phase 4 - Advanced Application',
            modules: [
              { title: 'Full Stack Capstone Project', description: 'Design, write, and secure a multi-service web backend and deploy it.' }
            ]
          }
        ]
      };
    }

    // Default to Frontend/Full-stack style roadmap
    return {
      goal: careerGoal,
      estimatedDuration: '6 months',
      phases: [
        {
          phaseTitle: 'Phase 1 - Foundation',
          modules: [
            { title: 'JS Fundamentals', description: 'Variables, Data Types, Control Flow, and Loops.' }
          ]
        },
        {
          phaseTitle: 'Phase 2 - Core Skills',
          modules: [
            { title: 'DOM Manipulation', description: 'Selecting, modifying, and updating HTML elements in browser.' },
            { title: 'Async Programming', description: 'Promises, Async/Await, and the event loop.' }
          ]
        },
        {
          phaseTitle: 'Phase 3 - Architecture & Frameworks',
          modules: [
            { title: 'APIs', description: 'Network requests and data handling.' },
            { title: 'React', description: 'Components, State, and Props.' }
          ]
        },
        {
          phaseTitle: 'Phase 4 - Advanced Application',
          modules: [
            { title: 'Full Stack Capstone Project', description: 'Build, deploy, and document a complete web application integrating all previous modules.' }
          ]
        }
      ]
    };
  }

  private static getMockChatResponse(message: string, context: ChatContext): string {
    const lowerMessage = message.toLowerCase();

    // Check if questioning about CSS flexbox/alignment (matches screenshot)
    if (lowerMessage.includes('justify-content') || lowerMessage.includes('align-items') || lowerMessage.includes('flexbox')) {
      return `I can help with that. Think of \`justify-content\` as controlling alignment along the **Main Axis** (usually horizontal), and \`align-items\` controlling alignment along the **Cross Axis** (usually vertical).

For example, if you set \`flex-direction: row\` (the default):
- \`justify-content: center\` centers your child items horizontally.
- \`align-items: center\` centers your child items vertically.

Here is a short code snippet to demonstrate:
\`\`\`css
.container {
  display: flex;
  flex-direction: row;
  justify-content: center; /* Horizontally center */
  align-items: center;     /* Vertically center */
  height: 200px;
}
\`\`\``;
    }

    if (lowerMessage.includes('promise') || lowerMessage.includes('async') || lowerMessage.includes('await')) {
      return `Since you are currently working through **Async Programming** and your recent assessments show you're tackling Promise chains, let's look at how \`async/await\` simplifies this.

A Promise is an object representing eventual completion. Chaining with \`.then()\` can get nested. Instead, we use \`await\` inside \`async\` functions:

\`\`\`javascript
// With Promise chains:
fetchData()
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// With Async/Await:
async function getData() {
  try {
    const res = await fetchData();
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
\`\`\``;
    }

    return `Hello! As your LearnPath AI Mentor, I see your career goal is **${context.careerGoal}**.
Currently, you are focusing on **${context.currentPathItem || 'JS Foundations'}**.

Your strongest skill is **${context.skills[0]?.name || 'JS Fundamentals'}**, but I noticed you might want to spend some extra time on **${context.weakAreas[0] || 'Async Programming'}**.

How can I assist you with your learning goals today? Feel free to paste any code questions!`;
  }
}
