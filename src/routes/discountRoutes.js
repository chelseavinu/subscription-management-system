const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const { validateCreateDiscount } = require('../middlewares/validator');

router.use(authMiddleware);

// Create new discount rule
router.post('/', validateCreateDiscount, discountController.createDiscount);

// Validate and calculate discount
router.post('/validate', discountController.validateDiscount);

// List all discounts
router.get('/', discountController.getAllDiscounts);

module.exports = router;
