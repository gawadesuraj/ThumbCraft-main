class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const item = new this.model(data);
    return await item.save();
  }

  async findById(id, populateOptions = '') {
    return await this.model.findById(id).populate(populateOptions);
  }

  async findOne(filter, populateOptions = '', selectOptions = '') {
    return await this.model.findOne(filter).select(selectOptions).populate(populateOptions);
  }

  async find(filter = {}, populateOptions = '', sortOptions = { createdAt: -1 }, limit = 0, skip = 0) {
    let query = this.model.find(filter).sort(sortOptions);
    if (skip > 0) query = query.skip(skip);
    if (limit > 0) query = query.limit(limit);
    return await query.populate(populateOptions);
  }

  async updateById(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async updateOne(filter, updateData) {
    return await this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter) {
    return await this.model.deleteMany(filter);
  }

  async countDocuments(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
