import express from 'express';
import morgan from 'morgan';
import { register, httpRequestDurationSeconds, collectDefaultMetrics } from './metrics.js';
import healthRouter from './routes/health.js';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// Duration metric for every request
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

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from There this is DevOps Sample!',
    env: process.env.NODE_ENV || 'development',
  });
});

app.use('/health', healthRouter);

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Start
const port = process.env.PORT || 3000;
collectDefaultMetrics(); // default process metrics

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
