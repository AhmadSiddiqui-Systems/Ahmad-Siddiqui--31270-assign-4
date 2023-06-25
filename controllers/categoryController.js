const Category = require('../models/categoryModel');

const getCategory = async (req, res) => {
  try {
    const category = await Category.find({});

    return res.json({ message: 'All Categories', category });
  } catch (error) {
    return res.send(error);
  }
};

const createCategory = async (req, res) => {
  const { name, subCategory } = req.body;

  if (!name || !subCategory) {
    return res.send('Plz fill al the fields!');
  }

  try {
    const categoryExist = await Category.findOne({ name });

    if (categoryExist) {
      const subCategoryExist = categoryExist.subCategory.find((sub) => sub.subName === subCategory[0].subName && sub.subBrand === subCategory[0].subBrand);
      if (subCategoryExist) {
        return res.json({ message: 'Sub Category Already Existed!' });
      }
      await Category.updateOne(
        { _id: categoryExist._id },
        { $push: { subCategory } },
      );
      return res.json({ message: 'Sub Category Created Successfully!' });
    }

    const category = await Category.create({
      name,
      subCategory,
    });

    return res.json({ message: 'New Category Created Successfully!', category });
  } catch (error) {
    return res.send(error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, subCategory } = req.body;
    const { subId, subName, subBrand } = subCategory;

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      res.status(404).send('Category not found');
      return;
    }
    const existSubCategory = category.subCategory.find((ele) => {
      if (ele._id.toString() === subId.toString()) {
        return ele;
      }
      return null;
    });

    const index = category.subCategory.indexOf(existSubCategory);

    await Category.updateOne(
      { _id: categoryId },
      {
        $set: {
          name,
          [`subCategory.${index}.subName`]: subName,
          [`subCategory.${index}.subBrand`]: subBrand,
        },
      },
    );

    res.json({ message: 'Category Updated' });
  } catch (error) {
    res.send(error);
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.find({ _id: id });

    if (!category) {
      res.json({ error: 'Category not Found!' });
    }
    await Category.deleteOne({ _id: id });

    return res.json({ message: 'Category Deleted!' });
  } catch (error) {
    return res.send(error);
  }
};

module.exports = {
  createCategory, getCategory, updateCategory, deleteCategory,
};
