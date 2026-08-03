import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use('/api', routes);

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Train booking API is running',
    endpoints: [
      '/api/stations',
      '/api/seats/available',
      '/api/bookings',
      '/api/bookings/:id/cancel'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();