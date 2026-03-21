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

// 3. CORS: environment-controlled
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-orchestrator-transaction-id']
}));

// 4. Rate Limiting: environment-controlled
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use(limiter);

// --- Core Middleware ---

app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(transactionIdMiddleware);
// Removed loggerConsole in favor of centralized logging or refined middleware if needed
// app.use(loggerConsole); 

const apiVersion = process.env.API_VERSION || 'v1';

app.use(`/api/${apiVersion}`, healthCheckRoute);
app.use(`/api/${apiVersion}/api-engine`, orchestratorRoute);
app.use(`/api/${apiVersion}/onboard-service`, onboardingRoute);
app.use(`/api/${apiVersion}/admin`, adminRoute);

// Shorthand Gateway Route: Support /api-gateway/:port/path?workflowCode=...
import { executeWorkflow } from "./services/orchestratorService.js";
app.use('/api-gateway/:port', async (req, res, next) => {
    const { workflowCode } = req.query;
    if (!workflowCode) {
        return res.status(400).json({ success: false, message: "workflowCode query parameter is required" });
    }

    const transactionId = `tx_sh_${Date.now()}`;
    try {
        const result = await executeWorkflow(
            workflowCode as string,
            { body: req.body, headers: req.headers, query: req.query },
            transactionId,
            req.method
        );
        res.status(200).json({ success: true, transactionId, data: result.downstreamBody });
    } catch (err: any) {
        res.status(500).json({ success: false, transactionId, message: err.message });
    }
});

setupSwagger(app);

app.use(errorHandler);

export default app;