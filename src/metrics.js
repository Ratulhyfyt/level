import client from 'prom-client';

const register = new client.Registry();

// Default labels help distinguish between envs
register.setDefaultLabels({
  app: 'node-express-devops-sample',
  env: process.env.NODE_ENV || 'development'
});

// Collect default metrics (process_cpu_user_seconds_total, nodejs_eventloop_lag_seconds, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics.bind(client, { register });

// Custom histogram for HTTP request duration
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestDurationSeconds);

export { register, collectDefaultMetrics, httpRequestDurationSeconds };
