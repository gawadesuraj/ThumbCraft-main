const BaseRepository = require('./baseRepository');
const Template = require('../models/Template');

class TemplateRepository extends BaseRepository {
  constructor() {
    super(Template);
  }

  async getByCategory(category) {
    return await this.find({ category }, '', { name: 1 });
  }

  async getPublicTemplates() {
    return await this.find({ isCommunity: false }, '', { category: 1, name: 1 });
  }
}

module.exports = new TemplateRepository();
