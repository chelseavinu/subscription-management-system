const billingEngineService = require('../services/billingEngineService');

/**
 * Controller for Automated Billing Day & Financial Reporting
 */
exports.triggerBillingRun = async (req, res, next) => {
  try {
    const { target_date, dry_run = false, auto_confirm = false } = req.body;
    const runDate = target_date ? new Date(target_date) : new Date();

    const summary = await billingEngineService.triggerBillingRun(runDate, {
      dryRun: Boolean(dry_run),
      autoConfirm: Boolean(auto_confirm)
    });

    return res.status(200).json({
      success: true,
      message: dry_run
        ? `Billing dry-run simulation complete for ${runDate.toISOString().split('T')[0]}`
        : `Billing Day run complete: ${summary.invoices_generated} invoices generated, ${summary.skipped_already_billed} duplicates safely skipped`,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

exports.getFinancialMetrics = async (req, res, next) => {
  try {
    const metrics = await billingEngineService.getFinancialMetrics();
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};
