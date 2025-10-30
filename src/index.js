import express from 'express';
import morgan from 'morgan';
import { register, httpRequestDurationSeconds, collectDefaultMetrics } from './metrics.js';
import healthRouter from './routes/health.js';

const app = express();

// Basic middleware
app.use(express.json());
app.use(morgan('combined'));

// Measure request duration for all routes
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      code: res.statusCode,
    });
  });
  next();
});

// Root hint
app.get('/', (_req, res) => {
  res.type('text/plain').send(
    'OK: backend is running.\nTry: /api , /health , /metrics'
  );
});

// API route (this returns the JSON you want)
app.get('/api', (_req, res) => {
  res.json({
    message: 'Hello from There this is DevOps Sample! ',
    env: process.env.NODE_ENV || 'development',
  });
});

// Health route
app.use('/health', healthRouter);

// Prometheus metrics
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Start server
const port = process.env.PORT || 3000;
collectDefaultMetrics(); // collect process metrics, etc.

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
