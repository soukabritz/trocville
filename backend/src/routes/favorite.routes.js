const { Router } = require('express');

const favoriteController = require('../controllers/favorite.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', favoriteController.listMine);
router.get('/ids', favoriteController.listIds);
router.post('/:itemId', favoriteController.toggle);

module.exports = router;
