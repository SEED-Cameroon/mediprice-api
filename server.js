import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './src/config/swagger.js';

import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { requireJson } from './src/middleware/auth.js';
import userRoutes from './src/routes/user.routes.js';
import healthRoutes from './src/routes/health.routes.js';
import medicationRoutes from './src/routes/medication.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import priceRoutes from './src/routes/price.routes.js';
import providerRoutes from './src/routes/provider.routes.js';
import compareRoutes from './src/routes/compare.routes.js';
import authRoutes from './src/routes/auth.routes.js';

const app = express();
// Number of proxies in front of the API, so rate limiting sees each visitor's
// address: 1 for Render alone, 2 when the web app's Vercel rewrite forwards
// /api through Vercel and then Render (set TRUST_PROXY_HOPS=2 on Render).
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);

// CORS_ORIGIN may list several origins, comma-separated
// (e.g. the Vite dev server and a preview build).
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean);
// credentials: the web app sends the httpOnly session cookie. Browsers only
// allow that for an explicit origin list, so set CORS_ORIGIN in production.
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : undefined, credentials: true }));
app.use(express.json({ limit: '1mb' }));
// CSRF guard: writes must be JSON (see requireJson).
app.use('/api', requireJson);

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec)
);


app.use('/api/health', healthRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/services', serviceRoutes)
app.use('/api/prices', priceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Fire off the DB connection without blocking server startup — connectDB
// logs its own errors and never throws, so a missing/unreachable Mongo
// instance can never crash the process.
connectDB();

// Centralized error handler — must be the last app.use().
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MediPrice API listening on port ${PORT}`);
});

