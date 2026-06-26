const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth } = require('../middlewares/auth');
const { validateProject } = require('../middlewares/validator');

router.use(requireAuth); // All routes in this file are protected

// Folders CRUD
router.post('/folders', projectController.createFolder);
router.get('/folders', projectController.getFolders);
router.delete('/folders/:folderId', projectController.deleteFolder);

// Projects CRUD
router.post('/', validateProject, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:projectId', projectController.getProjectById);
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;
