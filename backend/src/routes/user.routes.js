const { Router } = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate.middleware');

const router = Router();

router.get('/me', authMiddleware, userController.getMe);

router.put(
  '/me',
  authMiddleware,
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est obligatoire.'),
    body('lastName').trim().notEmpty().withMessage('Le nom est obligatoire.'),
    body('mainCity').trim().notEmpty().withMessage('La ville principale est obligatoire.'),
    validateRequest
  ],
  userController.updateMe
);

router.get('/:id', userController.getPublicProfile);

module.exports = router;
