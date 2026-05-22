const Banner =
  require("../models/banner");

const cloudinary =
  require("../cloudinaryconfig");

/*
CREATE BANNER
*/
exports.createBanner =
async (req, res) => {
  try {

    let imageUrl = "";

    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path
        );

      imageUrl =
        result.secure_url;
    }

    const banner =
      await Banner.create({
        image: imageUrl,
        title: req.body.title,
        description:
          req.body.description
      });

    res.status(201).json({
      success: true,
      message:
        "Banner created successfully",
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};
/*
UPDATE BANNER
*/
exports.updateBanner =
async (req, res) => {
  try {

    let imageUrl =
      req.body.image;

    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path
        );

      imageUrl =
        result.secure_url;
    }

    const banner =
      await Banner.findByIdAndUpdate(
        req.params.id,
        {
          image: imageUrl,
          title:
            req.body.title,
          description:
            req.body.description
        },
        {
          new: true
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Banner updated successfully",
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

/*
GET ALL BANNERS
*/
exports.getAllBanners =
async (req, res) => {
  try {

    const banners =
      await Banner.find();

    res.status(200).json({
      success: true,
      data: banners
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};
/*
DELETE BANNER
*/
exports.deleteBanner =
async (req, res) => {
  try {

    const banner =
      await Banner.findByIdAndDelete(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Banner deleted successfully",
      data: banner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};