import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { transactionIdMiddleware } from './middleware/transactionIdMiddleware.js';
import { loggerConsole } from './middleware/loggerConsole.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './config/swagger.js';
import healthCheckRoute from './routes/healthCheckRoute.js';
import { env } from 'process';
import orchestratorRoute from './routes/orchestratorRoute.js';
import onboardingRoute from './routes/onboardingRoute.js';
import adminRoute from './routes/adminRoute.js';

const app = express();

// --- Security & Performance Middleware ---

// 1. Helmet: Sets various HTTP headers for security
app.use(helmet());

// 2. Compression: Gzip compresses responses for speed
app.use(compression());

// 3. CORS: Allow all origins for now (restrict in production)
app.use(cors({
    origin: '*', // Change to specific domain in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-orchestrator-transaction-id']
}));

// 4. Rate Limiting: Prevent abuse (100 reqs / 15 min per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use(limiter);

// --- Core Middleware ---

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(transactionIdMiddleware);
app.use(loggerConsole);

const apiVersion = env.API_VERSION || 'v1';

app.use(`/api/${apiVersion}`, healthCheckRoute);
app.use(`/api/${apiVersion}/api-engine`, orchestratorRoute);
app.use(`/api/${apiVersion}/onboard-service`, onboardingRoute);
app.use(`/api/${apiVersion}/admin`, adminRoute);

setupSwagger(app);

app.use(errorHandler);

export default app;