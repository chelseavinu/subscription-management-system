import QuotationTemplate from '../models/QuotationTemplate.js';
import Product from '../models/Product.js';
import Plan from '../models/Plan.js';

/**
 * @desc    Get all quotation templates
 * @route   GET /api/quotation-templates
 * @access  Private (Admin, Staff, or Customer inspecting templates)
 */
export const getQuotationTemplates = async (req, res, next) => {
  try {
    const query = { is_active: true };

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    const templates = await QuotationTemplate.find(query)
      .populate('plan', 'name billing_interval base_price')
      .populate('items.product', 'name type sales_price variants')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single quotation template by ID
 * @route   GET /api/quotation-templates/:id
 * @access  Private
 */
export const getQuotationTemplateById = async (req, res, next) => {
  try {
    const template = await QuotationTemplate.findById(req.params.id)
      .populate('plan', 'name billing_interval base_price allow_pause')
      .populate('items.product', 'name type sales_price variants notes');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: `Quotation template not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new quotation template
 * @route   POST /api/quotation-templates
 * @access  Private (Admin, Staff)
 */
export const createQuotationTemplate = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category = 'Enterprise',
      plan_id,
      items = [],
      payment_terms = 'Net 30',
      validity_days = 30,
      discount,
    } = req.body;

    if (!name || !plan_id || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide template name, associated plan, and at least one product item',
      });
    }

    const plan = await Plan.findById(plan_id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Process items snapshot
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product_id}`,
        });
      }

      processedItems.push({
        product: product._id,
        product_name: product.name,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || product.sales_price,
        variant_name: item.variant_name || '',
        variant_addon: Number(item.variant_addon) || 0,
        tax_pct: Number(item.tax_pct) || 10,
      });
    }

    const template = await QuotationTemplate.create({
      name: name.trim(),
      description: description || '',
      category,
      plan: plan._id,
      items: processedItems,
      payment_terms,
      validity_days: Number(validity_days) || 30,
      discount,
    });

    const populatedTemplate = await QuotationTemplate.findById(template._id)
      .populate('plan', 'name billing_interval base_price')
      .populate('items.product', 'name type sales_price variants');

    return res.status(201).json({
      success: true,
      message: 'Quotation template created successfully',
      data: populatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};
