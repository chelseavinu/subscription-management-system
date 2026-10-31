const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const { validateRecordPayment } = require('../middlewares/validator');

router.use(authMiddleware);

// Record payment against invoice
router.post('/', validateRecordPayment, paymentController.recordPayment);

// Get all payment transactions
router.get('/', paymentController.getAllPayments);

// Get payments for a specific invoice
router.get('/invoice/:invoiceId', paymentController.getPaymentsByInvoice);

module.exports = router;
