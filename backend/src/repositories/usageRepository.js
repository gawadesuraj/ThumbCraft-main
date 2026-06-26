const BaseRepository = require('./baseRepository');
const Usage = require('../models/Usage');

class UsageRepository extends BaseRepository {
  constructor() {
    super(Usage);
  }

  async getUsageByUserId(userId, limit = 0, skip = 0) {
    return await this.find({ userId }, '', { createdAt: -1 }, limit, skip);
  }

  async aggregateUsageAnalytics(userId) {
    const mongoose = require('mongoose');
    return await this.model.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          totalCredits: { $sum: '$creditsConsumed' }
        }
      }
    ]);
  }
}

module.exports = new UsageRepository();
