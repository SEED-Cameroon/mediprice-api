import { Router } from 'express';
import { createMedication, getMedications, getMedication, medHistory } from '../controllers/medication.controller.js';
import { medicationAdmin } from '../controllers/catalog-admin.controller.js';
import { auth, requireRole } from '../middleware/auth.js';

const adminOnly = [auth, requireRole('admin')];

const router = Router();

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Create a medication
 *     description: Creates a new medication catalog entry.
 *     tags:
 *       - Medications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, genericName, category, description]
 *             properties:
 *               name: { type: string, example: Paracetamol }
 *               genericName: { type: string, example: Acetaminophen }
 *               category: { type: string, example: Pain relief }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Medication created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Medication' }
 *                 message: { type: string }
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', adminOnly, createMedication);
router.patch('/:id', adminOnly, medicationAdmin.update);
router.delete('/:id', adminOnly, medicationAdmin.remove);

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: List medications
 *     description: Search medications by name, filter by category, and paginate the results.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive, partial match against the medication name.
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
 *         description: Medications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Medication' }
 *                 message: { type: string }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getMedications);

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Get a medication's price comparison
 *     description: Returns the medication plus all of its prices across providers, pre-joined so the frontend does not need N follow-up calls.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medication and its prices retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Medication'
 *                     - type: object
 *                       properties:
 *                         prices:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Price' }
 *                 message: { type: string }
 *       404:
 *         description: Medication not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getMedication);

/**
 * @swagger
 * /api/medications/{id}/history:
 *   get:
 *     summary: Get a medication's price trend
 *     description: Returns the price history series for a medication so the frontend can chart a trend over time. Phase 2.
 *     tags:
 *       - Medications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: History retrieved successfully.
 *       404:
 *         description: Medication not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/history', medHistory);

export default router;
