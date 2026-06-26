const BaseRepository = require('./baseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return await query;
  }

  async deductCredits(userId, amount) {
    return await this.model.findByIdAndUpdate(
      userId,
      { $inc: { credits: -amount } },
      { new: true }
    );
  }

  async addCredits(userId, amount) {
    return await this.model.findByIdAndUpdate(
      userId,
      { $inc: { credits: amount } },
      { new: true }
    );
  }
}

module.exports = new UserRepository();
