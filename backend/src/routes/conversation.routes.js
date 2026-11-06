const { Router } = require('express');
const { body } = require('express-validator');

const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate.middleware');

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('itemId').isInt({ min: 1 }).withMessage('itemId est requis.'),
    validateRequest
  ],
  conversationController.start
);
router.get('/', conversationController.listMine);
router.get('/unread-count', conversationController.unreadCount);
router.get('/:id/messages', conversationController.listMessages);
router.post(
  '/:id/messages',
  [
    body('content').trim().notEmpty().withMessage('Le contenu du message est obligatoire.'),
    validateRequest
  ],
  conversationController.sendMessage
);

module.exports = router;
