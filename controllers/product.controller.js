const Product =
  require("../models/product");

const cloudinary =
  require("../cloudinaryconfig");
const GoldRate = require("../models/gold-rate");

const calculateProductPrices = require("../utils/product-price.helper");


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

      // LATEST GOLD RATE

      const latestGoldRate =

        await GoldRate.findOne()

          .sort({
            createdAt: -1
          });

      const ratePerGram =

        latestGoldRate?.ratePerGram || 0;

      // GET PRODUCTS

      const products =

        await Product.find()

          .populate("category")

          .populate("subCategory")

          .populate("subSubCategory")

          .sort({
            createdAt: -1
          });

      // PRICE CALCULATION

      const updatedProducts =

        products.map(product =>

          calculateProductPrices(
            product,
            ratePerGram
          )

        );

      // RESPONSE

      res.status(200).json({

        success: true,

        count:
          updatedProducts.length,

        data:
          updatedProducts

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

exports.getAllProductsWithPagination =
  async (req, res) => {

    try {

      // =========================
      // QUERY PARAMS
      // =========================

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const search =
        req.query.search || "";

      const skip =
        (page - 1) * limit;

      // =========================
      // SEARCH FILTER
      // =========================

      const searchFilter = {

        name: {
          $regex: search,
          $options: "i"
        }

      };

      // =========================
      // LATEST GOLD RATE
      // =========================

      const latestGoldRate =
        await GoldRate.findOne()
          .sort({
            createdAt: -1
          });

      const ratePerGram =
        latestGoldRate?.ratePerGram || 0;

      // =========================
      // TOTAL COUNT
      // =========================

      const totalProducts =

        await Product.countDocuments(

          search
            ? searchFilter
            : {}

        );

      // =========================
      // GET PRODUCTS
      // =========================

      const products =

        await Product.find(

          search
            ? searchFilter
            : {}

        )

          .populate("category")

          .populate("subCategory")

          .populate("subSubCategory")

          .sort({
            createdAt: -1
          })

          .skip(skip)

          .limit(limit);

      // =========================
      // USE HELPER
      // =========================

      const updatedProducts =

        products.map(product =>

          calculateProductPrices(
            product,
            ratePerGram
          )

        );

      // =========================
      // RESPONSE
      // =========================

      res.status(200).json({

        success: true,

        currentPage:
          page,

        totalPages:

          Math.ceil(
            totalProducts / limit
          ),

        totalProducts,

        count:
          updatedProducts.length,

        data:
          updatedProducts

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

    const { id } = req.params;

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
    // LATEST GOLD RATE
    // =====================================

    const latestGoldRate =

      await GoldRate.findOne()

        .sort({
          createdAt: -1
        });

    const ratePerGram =

      latestGoldRate?.ratePerGram || 0;

    // =====================================
    // USE HELPER
    // =====================================

    const updatedProduct =

      calculateProductPrices(

        product,

        ratePerGram

      );

    // =====================================
    // RESPONSE
    // =====================================

    res.status(200).json({

      success: true,

      message:
        'Product fetched successfully',

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

exports.getProductsByType = async (
  req,
  res
) => {

  try {

    const type =
      req.params.type.toUpperCase();

    let filter = {
      isActive: true
    };

    // =========================
    // FILTERS
    // =========================

    if (type === "POPULAR") {

      filter.popularCollection = true;

    }

    else if (type === "FEATURED") {

      filter.featured = true;

    }

    else if (type === "BESTSELLER") {

      filter.bestSeller = true;

    }

    else if (type === "TRENDING") {

      filter.trending = true;

    }

    else if (type === "NEW") {

      // no extra filter

    }

    else {

      return res.status(400).json({

        success: false,

        message:
          "Invalid Product Type"

      });

    }

    // =========================
    // LATEST GOLD RATE
    // =========================

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

      await Product.find(filter)

        .populate("category")

        .populate("subCategory")

        .populate("subSubCategory")

        .sort({
          createdAt: -1
        });

    // =========================
    // USE HELPER
    // =========================

    const updatedProducts =

      products.map(product =>

        calculateProductPrices(

          product,

          ratePerGram

        )

      );

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({

      success: true,

      data:
        updatedProducts

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

exports.getProductsByCategory = async (req, res) => {

  try {

    const {

      category,

      subCategory,

      productType,

      search = '',

      minPrice,

      maxPrice,

      sort = 'latest',

      featured,

      trending,

      bestSeller,

      gender,

      page = 1,

      limit = 10

    } = req.query;

    // =========================
    // PAGINATION
    // =========================

    const skip =

      (Number(page) - 1) *
      Number(limit);

    // =========================
    // FILTER OBJECT
    // =========================

    const filter = {

      isActive: true

    };

    // =========================
    // CATEGORY
    // =========================

    if (category) {

      filter.category = category;

    }

    // =========================
    // SUB CATEGORY
    // =========================

    if (subCategory) {

      filter.subCategory =
        subCategory;

    }

    // =========================
    // PRODUCT TYPE
    // =========================

    if (
      productType &&
      productType !== 'ALL'
    ) {

      filter.productType =
        productType;

    }

    // =========================
    // FEATURED
    // =========================

    if (featured === 'true') {

      filter.featured = true;

    }

    // =========================
    // TRENDING
    // =========================

    if (trending === 'true') {

      filter.trending = true;

    }

    // =========================
    // BESTSELLER
    // =========================

    if (bestSeller === 'true') {

      filter.bestSeller = true;

    }

    // =========================
    // GENDER
    // =========================

    if (gender) {

      filter.gender = gender;

    }

    // =========================
    // SEARCH
    // =========================

    if (search) {

      filter.name = {

        $regex: search,

        $options: 'i'

      };

    }

    // =========================
    // LATEST GOLD RATE
    // =========================

    const latestGoldRate =

      await GoldRate.findOne()

        .sort({
          createdAt: -1
        });

    const ratePerGram =

      latestGoldRate?.ratePerGram || 0;

    // =========================
    // FETCH PRODUCTS
    // =========================

    let products =

      await Product.find(filter)

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
        )

        .sort({

          createdAt:

            sort === 'latest'
              ? -1
              : 1

        })

        .skip(skip)

        .limit(Number(limit));

    // =========================
    // APPLY HELPER
    // =========================

    let updatedProducts =

      products.map(product =>

        calculateProductPrices(

          product,

          ratePerGram

        )

      );

    // =========================
    // PRICE FILTER
    // =========================

    if (minPrice || maxPrice) {

      updatedProducts =

        updatedProducts.filter(
          product => {

            const firstVariant =

              product.variants?.[0];

            const price =

              firstVariant?.finalPrice ||

              0;

            return (

              (!minPrice ||

                price >= Number(minPrice))

              &&

              (!maxPrice ||

                price <= Number(maxPrice))

            );

          }
        );

    }

    // =========================
    // LOW TO HIGH
    // =========================

    if (sort === 'lowToHigh') {

      updatedProducts.sort(
        (a, b) =>

          (a.variants?.[0]?.finalPrice || 0)

          -

          (b.variants?.[0]?.finalPrice || 0)
      );

    }

    // =========================
    // HIGH TO LOW
    // =========================

    if (sort === 'highToLow') {

      updatedProducts.sort(
        (a, b) =>

          (b.variants?.[0]?.finalPrice || 0)

          -

          (a.variants?.[0]?.finalPrice || 0)
      );

    }

    // =========================
    // TOTAL
    // =========================

    const total =

      await Product.countDocuments(
        filter
      );

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({

      success: true,

      total,

      currentPage:
        Number(page),

      totalPages:
        Math.ceil(total / limit),

      data:
        updatedProducts

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};