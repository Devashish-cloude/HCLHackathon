import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorMiddleware } from './middleware/errorMiddleware';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// Simple healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// API Routes mount
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorMiddleware);

// Launch server
app.listen(PORT, () => {
  console.log(`[LearnPath AI Server] running on port ${PORT}`);
  console.log(`Accepting requests from client at ${clientUrl}`);
});

export default app; // For testing
