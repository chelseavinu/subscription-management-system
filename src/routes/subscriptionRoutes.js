const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const { validateCreateSubscription, validateTransitionStatus } = require('../middlewares/validator');

router.use(authMiddleware);

// Preview calculation without saving
router.post('/calculate-preview', subscriptionController.calculatePreview);

// Create subscription or quote
router.post('/', validateCreateSubscription, subscriptionController.createSubscription);

// Create from quotation template (Sales rep scene)
router.post('/quote-template', validateCreateSubscription, subscriptionController.createFromQuotation);

// Get all subscriptions with filters
router.get('/', subscriptionController.getAllSubscriptions);

// Get single subscription
router.get('/:id', subscriptionController.getSubscriptionById);

// State transitions: draft -> quotation -> confirmed -> active -> closed / paused
router.post('/:id/transition', validateTransitionStatus, subscriptionController.transitionStatus);

// Renew subscription
router.post('/:id/renew', subscriptionController.renewSubscription);

module.exports = router;
