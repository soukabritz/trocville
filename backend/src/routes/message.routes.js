const { Router } = require('express');
const { body } = require('express-validator');

const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate.middleware');

const router = Router();

router.get('/trade-offer/:tradeOfferId', authMiddleware, messageController.listConversation);

router.post(
  '/',
  authMiddleware,
  [
    body('tradeOfferId').isInt().withMessage('tradeOfferId est requis.'),
    body('content').trim().notEmpty().withMessage('Le contenu du message est obligatoire.'),
    validateRequest
  ],
  messageController.createMessage
);

module.exports = router;
