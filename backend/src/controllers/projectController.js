const projectRepository = require('../repositories/projectRepository');
const folderRepository = require('../repositories/folderRepository');

class ProjectController {
  // Create Project
  async createProject(req, res, next) {
    try {
      let { name, description, folderId } = req.body;
      if (folderId === 'null' || folderId === 'undefined' || !folderId) {
        folderId = null;
      }
      const project = await projectRepository.create({
        name,
        description,
        userId: req.user.id,
        folderId
      });

      res.status(201).json({
        success: true,
        project,
        message: 'Project created successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  // Get User Projects
  async getProjects(req, res, next) {
    try {
      const { limit = 20, skip = 0 } = req.query;
      const projects = await projectRepository.findByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(skip)
      );
      const total = await projectRepository.countDocuments({ userId: req.user.id });

      res.json({
        success: true,
        projects,
        total
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Single Project
  async getProjectById(req, res, next) {
    try {
      const project = await projectRepository.findOne({
        _id: req.params.projectId,
        userId: req.user.id
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({
        success: true,
        project
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Project
  async deleteProject(req, res, next) {
    try {
      const deleted = await projectRepository.deleteById(req.params.projectId);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  // Folders CRUD: Create Folder
  async createFolder(req, res, next) {
    try {
      const { name } = req.body;
      const folder = await folderRepository.create({
        name,
        userId: req.user.id
      });

      res.status(201).json({
        success: true,
        folder,
        message: 'Folder created successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Folders
  async getFolders(req, res, next) {
    try {
      const folders = await folderRepository.findByUserId(req.user.id);
      res.json({
        success: true,
        folders
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Folder
  async deleteFolder(req, res, next) {
    try {
      const deleted = await folderRepository.deleteById(req.params.folderId);
      if (!deleted) {
        return res.status(404).json({ error: 'Folder not found or unauthorized' });
      }
      res.json({
        success: true,
        message: 'Folder deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProjectController();
