import Product from '../models/Product.js';
import Plan from '../models/Plan.js';

// ==========================================
// Product Controllers
// ==========================================

/**
 * @desc    Get all products with variants
 * @route   GET /api/products
 * @access  Public / Authenticated
 */
export const getProducts = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.type) {
      query.type = req.query.type.toLowerCase();
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public / Authenticated
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product with optional variants
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, type, sales_price, cost_price, notes, variants } = req.body;

    if (!name || sales_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and sales_price are required fields',
      });
    }

    // Format variants if provided
    let formattedVariants = [];
    if (Array.isArray(variants)) {
      formattedVariants = variants.map((v) => ({
        name: v.name?.trim(),
        option: v.option?.trim(),
        extra_price: Number(v.extra_price) || 0,
      }));
    }

    const product = await Product.create({
      name: name.trim(),
      type: type || 'service',
      sales_price: Number(sales_price),
      cost_price: Number(cost_price) || 0,
      notes: notes || '',
      variants: formattedVariants,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Plan Controllers
// ==========================================

/**
 * @desc    Get all active plans (or all plans if all=true)
 * @route   GET /api/plans
 * @access  Public / Authenticated
 */
export const getPlans = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') {
      filter.is_active = true;
    }
    if (req.query.billing_interval) {
      filter.billing_interval = req.query.billing_interval.toLowerCase();
    }

    const plans = await Plan.find(filter).sort({ base_price: 1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single plan by ID
 * @route   GET /api/plans/:id
 * @access  Public / Authenticated
 */
export const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a billing plan
 * @route   POST /api/plans
 * @access  Private (Admin only)
 */
export const createPlan = async (req, res, next) => {
  try {
    const {
      name,
      billing_interval,
      base_price,
      min_quantity,
      auto_close,
      allow_pause,
      is_active,
    } = req.body;

    if (!name || !billing_interval || base_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Plan name, billing_interval, and base_price are required fields',
      });
    }

    const plan = await Plan.create({
      name: name.trim(),
      billing_interval: billing_interval.toLowerCase().trim(),
      base_price: Number(base_price),
      min_quantity: min_quantity !== undefined ? Number(min_quantity) : 1,
      auto_close: Boolean(auto_close),
      allow_pause: Boolean(allow_pause),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a plan
 * @route   PUT /api/plans/:id
 * @access  Private (Admin only)
 */
export const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a plan
 * @route   DELETE /api/plans/:id
 * @access  Private (Admin only)
 */
export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Plan not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
