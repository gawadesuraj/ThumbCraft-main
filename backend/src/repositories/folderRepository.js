const BaseRepository = require('./baseRepository');
const Folder = require('../models/Folder');

class FolderRepository extends BaseRepository {
  constructor() {
    super(Folder);
  }

  async findByUserId(userId) {
    return await this.find({ userId }, '', { name: 1 });
  }
}

module.exports = new FolderRepository();
