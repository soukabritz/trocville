const { Router } = require('express');
const { body } = require('express-validator');

const itemController = require('../controllers/item.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate.middleware');
const { uploadItemPhoto } = require('../middlewares/upload.middleware');

const router = Router();

router.get('/', itemController.listItems);
router.get('/exchanges', authMiddleware, itemController.listExchanges);
router.get('/:id', itemController.getItem);

router.post(
  '/',
  authMiddleware,
  uploadItemPhoto,
  [
    body('title').trim().notEmpty().withMessage('Le titre est obligatoire.'),
    body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caract�res.'),
    body('categoryId').isInt({ min: 1 }).withMessage('La cat�gorie est obligatoire.'),
    body('conditionState').isIn(['new', 'good', 'fair']).withMessage('Etat invalide.'),
    body('city').trim().notEmpty().withMessage('La ville est obligatoire.'),
    body('creditPrice').isInt({ min: 10, max: 500 }).withMessage('Le prix doit �tre entre 10 et 500 cr�dits.'),
    validateRequest
  ],
  itemController.createItem
);

router.put(
  '/:id',
  authMiddleware,
  uploadItemPhoto,
  [
    body('title').trim().notEmpty().withMessage('Le titre est obligatoire.'),
    body('description').trim().isLength({ min: 10 }).withMessage('La description doit contenir au moins 10 caract�res.'),
    body('categoryId').isInt({ min: 1 }).withMessage('La cat�gorie est obligatoire.'),
    body('conditionState').isIn(['new', 'good', 'fair']).withMessage('Etat invalide.'),
    body('city').trim().notEmpty().withMessage('La ville est obligatoire.'),
    body('creditPrice').isInt({ min: 10, max: 500 }).withMessage('Le prix doit �tre entre 10 et 500 cr�dits.'),
    validateRequest
  ],
  itemController.updateItem
);

router.post('/:id/acquire', authMiddleware, itemController.acquireItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
