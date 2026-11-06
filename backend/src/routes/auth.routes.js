const { Router } = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validate.middleware');

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('Le prénom est obligatoire.'),
    body('lastName').trim().notEmpty().withMessage('Le nom est obligatoire.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères.'),
    body('mainCity').trim().notEmpty().withMessage('La ville principale est obligatoire.'),
    body('acceptTerms')
      .custom((value) => value === true)
      .withMessage('Tu dois accepter les conditions.'),
    validateRequest
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').notEmpty().withMessage('Le mot de passe est obligatoire.'),
    validateRequest
  ],
  authController.login
);

router.post(
  '/google',
  [
    body('idToken').optional({ values: 'falsy' }).isString(),
    body('accessToken').optional({ values: 'falsy' }).isString(),
    body().custom((_value, { req }) => {
      if (!req.body.idToken && !req.body.accessToken) {
        throw new Error('Jeton Google manquant.');
      }
      return true;
    }),
    validateRequest
  ],
  authController.google
);

router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Le code doit faire 6 chiffres.'),
    validateRequest
  ],
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  [body('email').isEmail().withMessage('Email invalide.'), validateRequest],
  authController.resendVerification
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email invalide.'), validateRequest],
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('Le code doit faire 6 chiffres.'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères.'),
    validateRequest
  ],
  authController.resetPassword
);

module.exports = router;
