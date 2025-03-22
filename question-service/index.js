import express from 'express';
import questionRoutes from './routes/question-routes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// All CORS handled in NGINX

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/questions', questionRoutes);

app.get('/', (req, res, next) => {
  console.log('Sending Greetings!');
  res.json({
    message: 'Hello World from question-service',
  });
});

// Handle When No Route Match Is Found
app.use((req, res, next) => {
  const error = new Error('Route Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;
