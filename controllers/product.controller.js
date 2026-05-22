const Product =
  require("../models/product");

const cloudinary =
  require("../cloudinaryconfig");
  const GoldRate =require("../models/gold-rate");

 console.log("GoldRate =", GoldRate);
console.log("Model Name =", GoldRate?.modelName);
console.log("FindOne Type =", typeof GoldRate?.findOne);


  /*
CREATE PRODUCT
*/
exports.createProduct = async (req, res) => {

  try {

    let imageUrls = [];

    let certificateUrl = "";

    let videoUrl = "";

    // =========================
    // PRODUCT IMAGES UPLOAD
    // =========================
    if (req.files?.images?.length > 0) {

      for (const file of req.files.images) {

        const result = await new Promise(
          (resolve, reject) => {

            cloudinary.uploader.upload_stream(

              {
                folder: "products"
              },

              (error, result) => {

                if (error)
                  reject(error);

                else
                  resolve(result);

              }

            ).end(file.buffer);

          }
        );

        imageUrls.push(result.secure_url);

      }

    }

    // =========================
    // CERTIFICATE UPLOAD
    // =========================
    if (
      req.files?.certificate?.length > 0
    ) {

      const certFile =
        req.files.certificate[0];

      const certResult =
        await new Promise(
          (resolve, reject) => {

            cloudinary.uploader.upload_stream(

              {
                folder: "certificates",
                resource_type: "auto"
              },

              (error, result) => {

                if (error)
                  reject(error);

                else
                  resolve(result);

              }

            ).end(certFile.buffer);

          }
        );

      certificateUrl =
        certResult.secure_url;

    }

    // =========================
    // VARIANTS PARSE
    // =========================
    let variants = req.body.variants
      ? JSON.parse(req.body.variants)
      : [];

    // =========================
    // CERTIFICATE URL ADD
    // =========================
    variants = variants.map(
      (variant) => ({

        ...variant,

        diamonds:
          variant.diamonds?.map(
            (diamond) => ({

              ...diamond,

              certificateUrl:
                certificateUrl

            })
          ) || []

      })
    );

    // =========================
    // CREATE PRODUCT
    // =========================
    const product =
      await Product.create({

        ...req.body,

        variants,

        tags:
          req.body.tags
          ? JSON.parse(req.body.tags)
          : [],

        images:
          imageUrls,
          video: videoUrl


      });

    res.status(201).json({

      success: true,

      message:
        "Product created successfully",

      data:
        product

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};



exports.updateProduct = async (req, res) => {

  try {

    const {
      id
    } = req.params;

    // =========================
    // FIND PRODUCT
    // =========================

    const existingProduct =
      await Product.findById(id);

    if (!existingProduct) {

      return res.status(404).json({

        success: false,

        message:
          "Product not found"

      });

    }

    // =========================
    // IMAGE URLS
    // =========================

    let imageUrls =
      existingProduct.images || [];

    // =========================
    // VIDEO URL
    // =========================

    let videoUrl =
      existingProduct.video || "";

    // =========================
    // CERTIFICATE URL
    // =========================

    let certificateUrl = "";

    // =====================================
    // PRODUCT IMAGES UPLOAD
    // =====================================

    if (
      req.files?.images?.length > 0
    ) {

      imageUrls = [];

      for (const file of req.files.images) {

        const result =
          await new Promise(
            (resolve, reject) => {

              cloudinary.uploader.upload_stream(

                {
                  folder: "products"
                },

                (error, result) => {

                  if (error)
                    reject(error);

                  else
                    resolve(result);

                }

              ).end(file.buffer);

            }
          );

        imageUrls.push(
          result.secure_url
        );

      }

    }

    // =====================================
    // VIDEO UPLOAD
    // =====================================

    if (
      req.files?.video?.length > 0
    ) {

      const videoFile =
        req.files.video[0];

      const videoResult =
        await new Promise(
          (resolve, reject) => {

            cloudinary.uploader.upload_stream(

              {

                folder: "videos",

                resource_type: "auto"

              },

              (error, result) => {

                if (error)
                  reject(error);

                else
                  resolve(result);

              }

            ).end(videoFile.buffer);

          }
        );

      videoUrl =
        videoResult.secure_url;

    }

    // =====================================
    // CERTIFICATE UPLOAD
    // =====================================

    if (
      req.files?.certificate?.length > 0
    ) {

      const certFile =
        req.files.certificate[0];

      const certResult =
        await new Promise(
          (resolve, reject) => {

            cloudinary.uploader.upload_stream(

              {

                folder: "certificates",

                resource_type: "auto"

              },

              (error, result) => {

                if (error)
                  reject(error);

                else
                  resolve(result);

              }

            ).end(certFile.buffer);

          }
        );

      certificateUrl =
        certResult.secure_url;

    }

    // =====================================
    // VARIANTS PARSE
    // =====================================

    let variants =
      req.body.variants
      ? JSON.parse(req.body.variants)
      : existingProduct.variants;

    // =====================================
    // CERTIFICATE URL ADD
    // =====================================

    variants = variants.map(
      (variant) => ({

        ...variant,

        diamonds:
          variant.diamonds?.map(
            (diamond) => ({

              ...diamond,

              certificateUrl:
                certificateUrl
                || diamond.certificateUrl
                || ""

            })
          ) || []

      })
    );

    // =====================================
    // UPDATE PRODUCT
    // =====================================

    const updatedProduct =
      await Product.findByIdAndUpdate(

        id,

        {

          ...req.body,

          variants,

          images:
            imageUrls,

          video:
            videoUrl,

          tags:
            req.body.tags
            ? JSON.parse(req.body.tags)
            : existingProduct.tags

        },

        {

          new: true

        }

      );

    // =====================================
    // RESPONSE
    // =====================================

    res.status(200).json({

      success: true,

      message:
        "Product updated successfully",

      data:
        updatedProduct

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
GET ALL PRODUCTS
*/
// =====================================
// GET ALL PRODUCTS
// =====================================

exports.getAllProducts =
  async (req, res) => {

    try {

      // =========================
      // LATEST GOLD RATE
      // =========================
console.log("GoldRate =", GoldRate);
console.log("modelName =", GoldRate?.modelName);
console.log("findOne =", typeof GoldRate?.findOne);
      const latestGoldRate =
        await GoldRate.findOne()
        .sort({
          createdAt: -1

        });
       

      const ratePerGram =
        latestGoldRate?.ratePerGram || 0;

      // =========================
      // GET PRODUCTS
      // =========================

      const products =
        await Product.find()

        .populate("category")

        .populate("subCategory")

        .populate("subSubCategory")

        .sort({
          createdAt: -1
        });

      // =========================
      // CALCULATE PRODUCTS
      // =========================

      const updatedProducts =
        products.map((product) => {

          const updatedVariants =

            product.variants.map(
              (variant) => {

                // =====================
                // GOLD PRICE
                // =====================

                const grossWeight =

                  Number(
                    variant.grossWeight || 0
                  );

                const goldCost =

                  grossWeight *

                  ratePerGram;

                // =====================
                // WASTAGE PRICE
                // =====================

                const wastagePrice =

                  (
                    goldCost *

                    Number(
                      variant.wastagePercentage || 0
                    )

                  ) / 100;

                // =====================
                // DIAMOND PRICE
                // =====================

                let totalDiamondPrice = 0;

                variant.diamonds.forEach(
                  (diamond) => {

                    totalDiamondPrice +=

                      (

                        Number(
                          diamond.diamondPrice || 0
                        )

                      )

                      *

                      (

                        Number(
                          diamond.totalDiamonds || 1
                        )

                      );

                  }
                );

                // =====================
                // TOTAL PRICE
                // =====================

                const totalPrice =

                  goldCost +

                  wastagePrice +

                  Number(
                    variant.makingCharges || 0
                  ) +

                  totalDiamondPrice;

                // =====================
                // DISCOUNT AMOUNT
                // =====================

                const discountAmount =

                  (

                    totalPrice *

                    Number(
                      variant.discountPercentage || 0
                    )

                  ) / 100;

                // =====================
                // FINAL PRICE
                // =====================

                const finalPrice =

                  totalPrice -

                  discountAmount;

                // =====================
                // RETURN VARIANT
                // =====================

                return {

                  ...variant.toObject(),

                  goldRatePerGram:
                    ratePerGram,

                  goldCost,

                  wastagePrice,

                  totalDiamondPrice,

                  totalPrice,

                  discountAmount,

                  finalPrice

                };

              }
            );

          return {

            ...product.toObject(),

            variants:
              updatedVariants

          };

        });

      // =========================
      // RESPONSE
      // =========================

      res.status(200).json({

        success: true,

        count:
          updatedProducts.length,

        data:
          updatedProducts

      });
      // =====================================
// VIDEO UPLOAD
// =====================================

if (
  req.files?.video?.length > 0
) {

  const videoFile =
    req.files.video[0];

  const videoResult =
    await new Promise(
      (resolve, reject) => {

        cloudinary.uploader.upload_stream(

          {
            folder: "videos",

            resource_type: "video"
          },

          (error, result) => {

            if (error)
              reject(error);

            else
              resolve(result);

          }

        ).end(videoFile.buffer);

      }
    );

  videoUrl =
    videoResult.secure_url;

}

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
DELETE PRODUCT
*/
exports.deleteProduct =
async (req, res) => {

  try {

    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {

      return res.status(404)
      .json({

        success: false,

        message:
          "Product not found"

      });

    }

    res.status(200).json({

      success: true,

      message:
        "Product deleted successfully"

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
GET PRODUCT BY ID
*/
// =====================================
// GET SINGLE PRODUCT BY ID
// =====================================

exports.getProductById = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;

    // =====================================
    // FIND PRODUCT
    // =====================================

    const product =
      await Product.findById(id)

        .populate(
          'category',
          'name image'
        )

        .populate(
          'subCategory',
          'name image'
        )

        .populate(
          'subSubCategory',
          'name image'
        );

    // =====================================
    // PRODUCT NOT FOUND
    // =====================================

    if (!product) {

      return res.status(404).json({

        success: false,

        message:
          'Product not found'

      });

    }

    // =====================================
    // RESPONSE
    // =====================================

    res.status(200).json({

      success: true,

      message:
        'Product fetched successfully',

      data:
        product

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

