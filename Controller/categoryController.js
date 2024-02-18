const Category = require('../Model/categoryModel');
const crudController = require('../Controller/crudController')
const AppError = require('../Utils/appError')
const responseController = require('../Controller/responseController');
const projectController = require('../Controller/projectController');

exports.setGroup =  async (req, res, next) => {
  req.body.group = req.params.groupID
  next()
}

exports.createCategory = crudController.createOne(Category)
exports.deleteCategory = crudController.deleteOne(Category);

exports.getAllCategories = async (req, res, next) => {
  try {
    let data = await Category.find({ group: req.params.groupID });

    const projects = await projectController.getAllProjects();
  
    data = data.map(category => {
      let categoryProjects = projects
      .filter(project => project.category.toString() === category._id.toString())
    
      return {
        ...category._doc,
        projects: categoryProjects
      }
    })

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
}

