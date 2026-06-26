const usageRepository = require('../repositories/usageRepository');
const userRepository = require('../repositories/userRepository');

class AnalyticsController {
  // Fetch aggregate user analytics metrics
  async getUserAnalytics(req, res, next) {
    try {
      const stats = await usageRepository.aggregateUsageAnalytics(req.user.id);
      const user = await userRepository.findById(req.user.id);

      res.json({
        success: true,
        credits: {
          remaining: user ? user.credits : 0,
          quota: user ? user.creditQuota : 0
        },
        usage: stats
      });
    } catch (err) {
      next(err);
    }
  }

  // Fetch chronological usage log history
  async getUsageLogs(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const logs = await usageRepository.getUsageByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(skip)
      );

      res.json({
        success: true,
        logs
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
