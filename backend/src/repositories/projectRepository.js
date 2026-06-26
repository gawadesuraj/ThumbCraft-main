const BaseRepository = require('./baseRepository');
const Project = require('../models/Project');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findByUserId(userId, limit = 0, skip = 0) {
    return await this.find({ userId }, '', { createdAt: -1 }, limit, skip);
  }

  async incrementThumbnailCount(projectId) {
    return await this.model.findByIdAndUpdate(
      projectId,
      { $inc: { thumbnailCount: 1 } },
      { new: true }
    );
  }
}

module.exports = new ProjectRepository();
