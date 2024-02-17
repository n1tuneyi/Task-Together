const express = require('express');
const router = express.Router({ mergeParams: true });
const categoryController = require('../Controller/categoryController');
const projectRouter = require('./projectRoutes');

router.use(authController.protect);

router
  .route('/')
  .post(categoryController.createCategory)
  .get(categoryController.getAllCategories);

router
.route('/:categoryID')
.delete(categoryController.deleteCategory)

router.use('/:categoryID/projects', projectRouter)

module.exports = router