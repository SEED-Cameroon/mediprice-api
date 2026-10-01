import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { auth, rateLimit } from "../middleware/auth.js";

// 10 login attempts per IP every 15 minutes, on top of per-account lockout.
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register an account
 *     description: Creates a new user account. Scaffolding for the upcoming community price-reporting feature — no other endpoint requires a logged-in user yet.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *                 message: { type: string }
 *       400:
 *         description: User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in
 *     description: Exchanges valid credentials for a JWT bearer token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         name: { type: string }
 *                         email: { type: string }
 *                         role: { type: string }
 *                 message: { type: string }
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", loginLimit, login);

// Clears the session cookie.
router.post("/logout", logout);

// The signed-in user (401 if not signed in).
router.get("/me", auth, me);

export default router;
