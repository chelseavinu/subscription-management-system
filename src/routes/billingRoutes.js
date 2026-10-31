const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const { validateBillingRun } = require('../middlewares/validator');

router.use(authMiddleware);

// Trigger automated billing day run (with idempotency)
router.post('/trigger-run', validateBillingRun, billingController.triggerBillingRun);

// Get Financial & Revenue Metrics for Finance Dashboard
router.get('/metrics', billingController.getFinancialMetrics);

module.exports = router;
