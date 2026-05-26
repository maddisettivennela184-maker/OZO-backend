const mongoose = require("mongoose");


// =========================
// Diamond Details Schema
// =========================

const diamondSchema =
  new mongoose.Schema({

    diamondType: {
      type: String,
      enum: [
        "NATURAL",
        "LAB_GROWN"
      ],
      default: "NATURAL"
    },

    shape: {
      type: String,
      enum: [
        "ROUND",
        "OVAL",
        "PRINCESS",
        "CUSHION",
        "EMERALD",
        "PEAR",
        "HEART",
        "MARQUISE"
      ]
    },

    carat: {
      type: Number
    },

    color: {
      type: String
    },

    clarity: {
      type: String
    },

    cut: {
      type: String
    },

    polish: {
      type: String
    },

    symmetry: {
      type: String
    },

    fluorescence: {
      type: String
    },

    certificateLab: {
      type: String,
      enum: [
        "GIA",
        "IGI",
        "HRD",
        "AGS",
        "NONE"
      ],
      default: "NONE"
    },

    certificateNumber: {
      type: String
    },

    certificateUrl: {
      type: String
    },

    // SINGLE DIAMOND PRICE

    diamondPrice: {
      type: Number,
      default: 0
    },

    // HOW MANY DIAMONDS

    totalDiamonds: {
      type: Number,
      default: 1
    }

  }, {
    _id: false
  });




// =========================
// Variant Schema
// =========================

const variantSchema =
  new mongoose.Schema({

    size: {
      type: String
    },

    stock: {
      type: Number,
      default: 0
    },

    // =========================
    // GOLD DETAILS
    // =========================

    goldPurity: {
      type: String,
      enum: [
        "14K",
        "18K",
        "22K",
        "24K"
      ]
    },

    goldColor: {
      type: String,
      enum: [
        "YELLOW",
        "WHITE",
        "ROSE"
      ]
    },

    grossWeight: {
      type: Number
    },

    netWeight: {
      type: Number
    },

    wastagePercentage: {
      type: Number,
      default: 0
    },

    // =========================
    // MAKING CHARGES
    // =========================

    makingCharges: {
      type: Number,
      default: 0
    },

    // =========================
    // DIAMONDS
    // =========================

    hasDiamond: {
      type: Boolean,
      default: false
    },

    diamonds: [diamondSchema],

    // =========================
    // OFFER / DISCOUNT
    // =========================

    discountPercentage: {
      type: Number,
      default: 0
    }

  });




// =========================
// Product Schema
// =========================

const productSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      unique: true
    },

    shortDescription: {
      type: String
    },

    description: {
      type: String
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory"
    },

    subSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubCategory"
    },

    productType: {
      type: String,
      enum: [
        "GOLD",
        "DIAMOND",
        "GOLD_DIAMOND"
      ],
      required: true
    },

    gender: {
      type: String,
      enum: [
        "MEN",
        "WOMEN",
        "UNISEX"
      ]
    },

    occasion: {
      type: String
    },

    brand: {
      type: String
    },

    sku: {
      type: String,
      unique: true
    },

    hallmarkCertified: {
      type: Boolean,
      default: true
    },

    certificationIncluded: {
      type: Boolean,
      default: true
    },

    featured: {
      type: Boolean,
      default: false
    },

    bestSeller: {
      type: Boolean,
      default: false
    },

    trending: {
      type: Boolean,
      default: false
    },

    // =========================
    // VARIANTS
    // =========================

    variants: [variantSchema],

    // =========================
    // MEDIA
    // =========================

    images: [
      {
        type: String
      }
    ],

    video: {
      type: String
    },

    // =========================
    // TAGS
    // =========================

    tags: [
      {
        type: String
      }
    ],

    // =========================
    // SEO
    // =========================

    seoTitle: {
      type: String
    },

    seoDescription: {
      type: String
    },

    // =========================
    // STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true
    }

  }, {
    timestamps: true
  });



module.exports =

  mongoose.models.Product ||

  mongoose.model(
    "Product",
    productSchema
  );