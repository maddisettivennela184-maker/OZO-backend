const Category = require("../models/category");
const cloudinary = require("../cloudinaryconfig");


/*
 CREATE CATEGORY
*/
exports.createCategory =
async (req, res) => {

  try {

    console.log(
      "BODY:",
      req.body
    );

    console.log(
      "FILE:",
      req.file
    );

    const {

      name,

      isActive

    } = req.body;

    // VALIDATION

    if (!name) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Category name is required"

        });

    }

    let imageUrl = "";

    // IMAGE UPLOAD

   if (req.file) {

  const result =
    await new Promise(

      (
        resolve,
        reject
      ) => {

        cloudinary
          .uploader
          .upload_stream(

            {
              folder:
                "categories"
            },

            (
              error,
              result
            ) => {

              if (error)
                reject(error);

              else
                resolve(result);

            }

          )

          .end(
            req.file.buffer
          );

      }

    );

  imageUrl =
    result.secure_url;

}

    // CREATE CATEGORY

    const category =
      await Category.create({

        name,

        image:
          imageUrl,

        isActive

      });

    // RESPONSE

    res.status(201).json({

      success: true,

      message:
        "Category created successfully",

      data:
        category

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};



/*
 GET ALL CATEGORY
*/
exports.getAllCategories = async (req, res) => {
  try {

    const categories =
      await Category.find();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/*
 GET SINGLE CATEGORY
*/
exports.getCategoryById = async (req, res) => {
  try {

    const category =
      await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/*
 UPDATE CATEGORY
*/
exports.updateCategory = async (req, res) => {
  try {

    const category =
      await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const { name, isActive } = req.body;

    let imageUrl = category.image;

    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path
        );

      imageUrl = result.secure_url;
    }

    category.name =
      name || category.name;

    category.image = imageUrl;

    category.isActive =
      isActive ?? category.isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/*
 DELETE CATEGORY
*/
exports.deleteCategory = async (req, res) => {
  try {

    const category =
      await Category.findByIdAndDelete(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};