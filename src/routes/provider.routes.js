import { Router } from 'express';
import { createProvider, getProviders, getProvider } from '../controllers/provider.controller.js';
import { providerAdmin } from '../controllers/catalog-admin.controller.js';
import { auth, requireRole } from '../middleware/auth.js';

const adminOnly = [auth, requireRole('admin')];

const router = Router();

/**
 * @swagger
 * /api/providers:
 *   post:
 *     summary: Create a provider
 *     description: Creates a new pharmacy, laboratory, or hospital.
 *     tags:
 *       - Providers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, phone]
 *             properties:
 *               name: { type: string, example: Mezam Polyclinic Pharmacy }
 *               type: { type: string, enum: [pharmacy, lab, hospital] }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Provider created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Provider' }
 *                 message: { type: string }
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', adminOnly, createProvider);
// Admins edit any provider; a provider account edits its own contact details.
router.patch('/:id', auth, requireRole('admin', 'provider'), providerAdmin.update);
router.delete('/:id', adminOnly, providerAdmin.remove);

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: List providers
 *     description: Search providers by name, filter by type and city.
 *     tags:
 *       - Providers
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [pharmacy, lab, hospital] }
 *       - in: query
 *         name: city
 *         schema: { type: string, default: Bamenda }
 *     responses:
 *       200:
 *         description: Providers retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Provider' }
 *                 message: { type: string }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getProviders);

/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Get a provider's priced items
 *     description: Returns the provider plus every Price row where provider = this provider, across both medications and services.
 *     tags:
 *       - Providers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Provider and its prices retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider: { $ref: '#/components/schemas/Provider' }
 *                     price:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Price' }
 *                 message: { type: string }
 *       404:
 *         description: Provider not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getProvider);

export default router;
