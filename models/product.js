const mongoose = require("mongoose");


// =========================
// Diamond Details Schema
// =========================
const diamondSchema = new mongoose.Schema({

  diamondType: {
    type: String,
    enum: ["NATURAL", "LAB_GROWN"],
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
    // D, E, F, G...
  },

  clarity: {
    type: String
    // FL, IF, VVS1, VS1...
  },

  cut: {
    type: String
    // EX, VG, GOOD
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
    enum: ["GIA", "IGI", "HRD", "AGS", "NONE"],
    default: "NONE"
  },

  certificateNumber: {
    type: String
  },

  certificateUrl: {
    type: String
  },

  diamondPrice: {
    type: Number,
    default: 0
  },

  totalDiamonds: {
    type: Number,
    default: 1
  }

}, { _id: false });




// =========================
// Variant Schema
// =========================
const variantSchema = new mongoose.Schema({

  size: {
    type: String
  },

  stock: {
    type: Number,
    default: 0
  },

  // GOLD DETAILS
  goldPurity: {
    type: String,
    enum: ["14K", "18K", "22K", "24K"]
  },

  goldColor: {
    type: String,
    enum: ["YELLOW", "WHITE", "ROSE"]
  },

  grossWeight: {
    type: Number
  },

  netWeight: {
    type: Number
  },

  makingCharges: {
    type: Number,
    default: 0
  },

  wastagePercentage: {
    type: Number,
    default: 0
  },

  goldRate: {
    type: Number,
    default: 0
  },

  goldPrice: {
    type: Number,
    default: 0
  },

  // DIAMOND DETAILS
  hasDiamond: {
    type: Boolean,
    default: false
  },

  diamonds: [diamondSchema],

  totalDiamondPrice: {
    type: Number,
    default: 0
  },

  // FINAL PRICE
  basePrice: {
    type: Number,
    default: 0
  },

  discountPercentage: {
    type: Number,
    default: 0
  },

  finalPrice: {
    type: Number,
    default: 0
  }

});




// =========================
// Product Schema
// =========================
const productSchema = new mongoose.Schema({

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
    enum: ["MEN", "WOMEN", "UNISEX"]
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

  variants: [variantSchema],

  images: [
    {
      type: String
    }
  ],

  video: {
    type: String
  },

  tags: [
    {
      type: String
    }
  ],

  seoTitle: {
    type: String
  },

  seoDescription: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});


module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);