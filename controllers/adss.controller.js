const Ads = require("../models/adds");
const cloudinary = require("../cloudinaryconfig");

exports.createAds = async (req, res) => {
  try {

    const uploadImages = async (files = []) => {

      const imageUrls = [];

      for (const file of files) {

        const result = await new Promise((resolve, reject) => {

          cloudinary.uploader.upload_stream(
            { folder: "ads" },
            (error, result) => {

              if (error) reject(error);
              else resolve(result);

            }
          ).end(file.buffer);

        });

        imageUrls.push(result.secure_url);
      }

      return imageUrls;
    };

    const section1Images = await uploadImages(
      req.files?.section1Images || []
    );

    const section2Images = await uploadImages(
      req.files?.section2Images || []
    );

    const section3Images = await uploadImages(
      req.files?.section3Images || []
    );

    const section4Images = await uploadImages(
      req.files?.section4Images || []
    );

    const section5Images = await uploadImages(
      req.files?.section5Images || []
    );

    const ads = await Ads.create({

      section1: req.body.section1Title ? {
        title: req.body.section1Title,
        description: req.body.section1Description,
        images: section1Images,
        isActive: req.body.section1IsActive || true
      } : null,

      section2: req.body.section2Title ? {
        title: req.body.section2Title,
        description: req.body.section2Description,
        images: section2Images,
        isActive: req.body.section2IsActive || true
      } : null,

      section3: req.body.section3Title ? {
        title: req.body.section3Title,
        description: req.body.section3Description,
        images: section3Images,
        isActive: req.body.section3IsActive || true
      } : null,

      section4: req.body.section4Title ? {
        title: req.body.section4Title,
        description: req.body.section4Description,
        images: section4Images,
        isActive: req.body.section4IsActive || true
      } : null,

      section5: req.body.section5Title ? {
        title: req.body.section5Title,
        description: req.body.section5Description,
        images: section5Images,
        isActive: req.body.section5IsActive || true
      } : null

    });

    res.status(201).json({
      success: true,
      message: "Ads Created Successfully",
      data: ads
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


exports.getAllAds = async (
  req,
  res
) => {

  try {

    const ads =
      await Ads.find()
      .sort({
        createdAt: -1
      });

    res.status(200).json({

      success: true,

      count: ads.length,

      data: ads

    });

  }
  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};
exports.getAdsById = async (
  req,
  res
) => {

  try {

    const ads =
      await Ads.findById(
        req.params.id
      );

    if (!ads) {

      return res.status(404).json({

        success: false,

        message:
          "Ads not found"

      });

    }

    res.status(200).json({

      success: true,

      data: ads

    });

  }
  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};
exports.updateAds = async (req, res) => {
  try {

    const { id } = req.params;

    const ads = await Ads.findById(id);

    if (!ads) {
      return res.status(404).json({
        success: false,
        message: "Ads not found"
      });
    }

    const uploadImages = async (files = []) => {

      const imageUrls = [];

      for (const file of files) {

        const result = await new Promise((resolve, reject) => {

          cloudinary.uploader.upload_stream(
            { folder: "ads" },
            (error, result) => {

              if (error) reject(error);
              else resolve(result);

            }
          ).end(file.buffer);

        });

        imageUrls.push(result.secure_url);
      }

      return imageUrls;
    };

    const sections = [
      "section1",
      "section2",
      "section3",
      "section4",
      "section5"
    ];

    for (const section of sections) {

      const title = req.body[`${section}Title`];
      const description = req.body[`${section}Description`];
      const isActive = req.body[`${section}IsActive`];

      const uploadedImages = await uploadImages(
        req.files?.[`${section}Images`] || []
      );
      const existingImages =
  JSON.parse(
    req.body[`${section}ExistingImages`] || "[]"
  );

      if (
        title ||
        description ||
        isActive !== undefined ||
        uploadedImages.length
      ) {

       ads[section] = {

  title:
    title ||
    ads[section]?.title ||
    "",

  description:
    description ||
    ads[section]?.description ||
    "",

  images: [
    ...existingImages,
    ...uploadedImages
  ],

  isActive:
    isActive !== undefined
      ? isActive
      : ads[section]?.isActive ?? true

};

      }
    }

    await ads.save();

    res.status(200).json({
      success: true,
      message: "Ads Updated Successfully",
      data: ads
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};  
exports.deleteAds = async (
  req,
  res
) => {

  try {

    const ads =
      await Ads.findByIdAndDelete(
        req.params.id
      );

    if (!ads) {

      return res.status(404).json({

        success: false,

        message:
          "Ads not found"

      });

    }

    res.status(200).json({

      success: true,

      message:
        "Ads deleted successfully"

    });

  }
  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};