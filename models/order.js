const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

  // ======================
  // PRODUCT REFERENCE
  // ======================

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // ======================
  // PRODUCT SNAPSHOT
  // ======================

  productSnapshot: {

    name: {
      type: String,
      required: true
    },

    slug: String,

    image: String,

    category: String,

    subCategory: String

  },

  // ======================
  // VARIANT SNAPSHOT
  // ======================

  variantSnapshot: {

    sku: String,

    purity: String,

    size: String,

    grossWeight: Number,

    netWeight: Number,

    stoneWeight: Number,

    diamondWeight: Number,

    makingCharge: Number,

    stoneType: String,

    gender: String

  },

  // ======================
  // PRICE SNAPSHOT
  // ======================

  pricingSnapshot: {

    goldRate: Number,

    goldValue: Number,

    diamondValue: Number,

    stoneValue: Number,

    makingCharge: Number,

    gstAmount: Number

  },

  quantity: {
    type: Number,
    default: 1
  },

  unitPrice: {
    type: Number,
    required: true
  },

  totalPrice: {
    type: Number,
    required: true
  }

}, {
  _id: false
});

const orderSchema = new mongoose.Schema({

  // ======================
  // ORDER DETAILS
  // ======================

  orderNumber: {
    type: String,
    unique: true,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: {
    type: [orderItemSchema],
    required: true
  },

  // ======================
  // SHIPPING ADDRESS
  // ======================

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  addressSnapshot: {

    fullName: String,

    phone: String,

    alternatePhone: String,

    addressLine1: String,

    addressLine2: String,

    landmark: String,

    city: String,

    state: String,

    country: String,

    postalCode: String

  },

  // ======================
  // PAYMENT
  // ======================

  paymentMethod: {
    type: String,
    enum: [
      "COD",
      "ONLINE",
      "UPI",
      "CARD",
      "NETBANKING"
    ],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: [
      "Pending",
      "Paid",
      "Failed",
      "Refunded"
    ],
    default: "Pending"
  },

  transactionId: String,

  paymentGateway: String,

  paidAt: Date,

  // ======================
  // PRICE SUMMARY
  // ======================

  subTotal: {
    type: Number,
    required: true
  },

  discountAmount: {
    type: Number,
    default: 0
  },

  couponCode: String,

  shippingCharge: {
    type: Number,
    default: 0
  },

  gstAmount: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },

  // ======================
  // ORDER STATUS
  // ======================

  orderStatus: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded"
    ],
    default: "Pending"
  },

  // ======================
  // TRACKING
  // ======================

  trackingNumber: String,

  courierPartner: String,

  shippedAt: Date,

  deliveredAt: Date,

  expectedDeliveryDate: Date,

  cancelReason: String,

  returnReason: String,

  notes: String

}, {
  timestamps: true
});

module.exports =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );