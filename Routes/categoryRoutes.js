const express = require('express');
const router = express.Router({ mergeParams: true });
const categoryController = require('../Controller/categoryController');
const projectRouter = require('./projectRoutes');
const authController = require('../Controller/authController');

router.use(authController.protect);

router
  .route('/')
  .post(categoryController.setGroup, categoryController.createCategory)
  .get(categoryController.setGroup,  categoryController.getAllCategories);

router
.route('/:categoryID')
.delete(categoryController.deleteCategory)

router.use('/:categoryID/projects', projectRouter)

module.exports = router