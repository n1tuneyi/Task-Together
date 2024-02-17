const Category = require('../Model/categoryModel');
const crudController = require('../Controller/crudController')

exports.setGroup =  async (req, res, next) => {
  req.body.group = req.params.groupID
  next()
}

exports.createCategory = crudController.createOne(Category)
exports.deleteCategory = crudController.deleteOne(Category);

exports.getAllCategories = async (req, res, next) => {
  try {
    const data = await Category.find({ group: req.params.groupID });
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
}

