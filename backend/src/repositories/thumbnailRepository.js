const BaseRepository = require('./baseRepository');
const Thumbnail = require('../models/Thumbnail');

class ThumbnailRepository extends BaseRepository {
  constructor() {
    super(Thumbnail);
  }

  async findByUserId(userId, limit = 0, skip = 0) {
    return await this.find({ userId }, '', { createdAt: -1 }, limit, skip);
  }

  async findByProjectId(projectId, limit = 0, skip = 0) {
    return await this.find({ projectId }, '', { createdAt: -1 }, limit, skip);
  }

  async getFavorites(userId, limit = 0, skip = 0) {
    return await this.find({ userId, isFavorite: true }, '', { createdAt: -1 }, limit, skip);
  }

  async toggleFavorite(thumbnailId, userId) {
    const thumbnail = await this.findOne({ _id: thumbnailId, userId });
    if (!thumbnail) return null;
    
    thumbnail.isFavorite = !thumbnail.isFavorite;
    return await thumbnail.save();
  }
}

module.exports = new ThumbnailRepository();
