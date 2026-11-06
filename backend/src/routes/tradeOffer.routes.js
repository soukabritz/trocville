const { Router } = require('express');
const { body } = require('express-validator');

const tradeOfferController = require('../controllers/tradeOffer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate.middleware');

const router = Router();

router.get('/', authMiddleware, tradeOfferController.listMyTradeOffers);

router.post(
  '/',
  authMiddleware,
  [
    body('requestedItemId').isInt().withMessage('requestedItemId est requis.'),
    body('proposedItemId').isInt().withMessage('proposedItemId est requis.'),
    validateRequest
  ],
  tradeOfferController.createTradeOffer
);

router.patch(
  '/:id/status',
  authMiddleware,
  [
    body('status').isIn(['accepted', 'refused', 'completed']).withMessage('Statut invalide.'),
    validateRequest
  ],
  tradeOfferController.updateTradeOfferStatus
);

module.exports = router;
