import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, SCREENSHOTS_DIR, ARTIFACTS_DIR } from './config';
import { apiRouter } from './routes/api';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for browser screenshots and generated Excel/MD artifacts
app.use('/api/screenshots', express.static(SCREENSHOTS_DIR));
app.use('/api/artifacts', express.static(ARTIFACTS_DIR));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WebPilot ProofFlow Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` WebPilot ProofFlow Server running on http://localhost:${PORT}`);
  console.log(` Live Execution, Playwright & Verification Engine Ready`);
  console.log(`=======================================================`);
});
