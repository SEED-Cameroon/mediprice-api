import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import {
  deletePrice,
  importPrices,
  listPrices,
  priceHistory,
  updatePrice,
  upsertPrice,
} from '../controllers/price.controller.js';

const router = Router();

// Everything here needs a signed-in admin or provider. Providers are limited
// to their own provider's prices inside the controller.
router.use(auth, requireRole('admin', 'provider'));

router.get('/', listPrices);
router.post('/', upsertPrice);
router.post('/import', requireRole('admin'), importPrices);
router.patch('/:id', updatePrice);
router.delete('/:id', deletePrice);
router.get('/:id/history', priceHistory);

export default router;
