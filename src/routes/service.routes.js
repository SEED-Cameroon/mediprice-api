import { Router } from 'express';
import { createService, getServices, getService, serHistory } from '../controllers/service.controller.js';
import { serviceAdmin } from '../controllers/catalog-admin.controller.js';
import { auth, requireRole } from '../middleware/auth.js';

const adminOnly = [auth, requireRole('admin')];

const router = Router();

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a service
 *     description: Creates a new lab test or care service catalog entry.
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, category, description]
 *             properties:
 *               name: { type: string, example: Malaria test }
 *               type: { type: string, enum: [lab, care] }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Service created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Service' }
 *                 message: { type: string }
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', adminOnly, createService);
router.patch('/:id', adminOnly, serviceAdmin.update);
router.delete('/:id', adminOnly, serviceAdmin.remove);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: List services
 *     description: Search services by name, filter by type and category, and paginate the results.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive, partial match against the service name.
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [lab, care] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Max 100.
 *     responses:
 *       200:
 *         description: Services retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Service' }
 *                 message: { type: string }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a service's price comparison
 *     description: Returns the service plus all of its prices across providers, pre-joined so the frontend does not need N follow-up calls.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service and its prices retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Service'
 *                     - type: object
 *                       properties:
 *                         prices:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Price' }
 *                 message: { type: string }
 *       404:
 *         description: Service not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getService);

/**
 * @swagger
 * /api/services/{id}/history:
 *   get:
 *     summary: Get a service's price trend
 *     description: Returns the price history series for a service so the frontend can chart a trend over time. Phase 2.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: History retrieved successfully.
 *       404:
 *         description: Service not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/history', serHistory);

export default router;
