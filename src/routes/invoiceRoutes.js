const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Get all invoices with filtering (status, payment_status, customer, date)
router.get('/', invoiceController.getAllInvoices);

// Get single invoice details
router.get('/:id', invoiceController.getInvoiceById);

// Lifecycle transition: Confirm draft invoice
router.post('/:id/confirm', invoiceController.confirmInvoice);

// Lifecycle transition: Cancel invoice
router.post('/:id/cancel', invoiceController.cancelInvoice);

// Send electronic invoice simulation
router.post('/:id/send', invoiceController.sendInvoice);

// Get printable invoice layout
router.get('/:id/print', invoiceController.getPrintData);

module.exports = router;
