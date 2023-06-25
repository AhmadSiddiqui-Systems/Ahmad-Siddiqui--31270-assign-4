const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subCategory: [
    {
      subName: {
        type: String,
        required: true,
      },
      subBrand: {
        type: String,
        required: true,
      },
    },
  ],

}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
