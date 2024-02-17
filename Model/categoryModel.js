const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  }, 
  description : String,
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})


const Category = mongoose.model('Category', categorySchema);

module.exports = Category;