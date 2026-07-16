const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    variant: { type: mongoose.Schema.Types.ObjectId, required: true },

    productSnapshot: {
        name: { type: String, required: true },
        slug: String,
        image: String,
        category: String,
        subCategory: String,
        subSubCategory: String,
        productType: String,
        brand: String
    },

    variantSnapshot: {
        sku: String,
        metalType: String,
        purity: String,
        metalColor: String,
        size: String,
        grossWeight: Number,
        netWeight: Number,
        wastagePercentage: Number,
        stoneWeight: Number,
        diamondWeight: Number,
        makingCharge: Number,
        makingChargeType: String,
        discountPercentage: Number,
        stoneType: String,
        gender: String,
        // ADD THIS
    stones: [{
        stoneType: String,
        stoneCategory: String,
        quality: String,
        quantity: Number,
        totalWeight: Number,
        stoneValue: Number
    }]
    },

    pricingSnapshot: {
        goldRate: Number,
        goldValue: Number,
        wastageAmount: Number,
        stoneValue: Number,
        diamondValue: Number,
        makingCharge: Number,
        discountAmount: Number,
        gstPercentage: Number,
        gstAmount: Number,
        finalPrice: Number
    },

    quantity: { type: Number, default: 1 },

    unitPrice: { type: Number, required: true },

    totalPrice: { type: Number, required: true }

});

const orderSchema = new mongoose.Schema({

    // =====================
    // ORDER
    // =====================

    orderNumber: { type: String, unique: true, required: true },

    invoiceNumber: { type: String, unique: true },

    orderSource: {
        type: String,
        enum: ["ONLINE", "BRANCH", "SUB_BRANCH"],
        required: true
    },

    // =====================
    // BRANCH
    // =====================

    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },

    subBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null
    },

    // =====================
    // CUSTOMER
    // =====================

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    customerDetails: {
        name: String,
        phone: String,
        email: String
    },

    // =====================
    // ITEMS
    // =====================

    items: {
        type: [orderItemSchema],
        required: true
    },

    // =====================
    // ADDRESS
    // =====================

    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        default: null
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

    // =====================
    // PAYMENT
    // =====================

    paymentMethod: {
        type: String,
        enum: ["CASH", "UPI", "CARD", "NETBANKING", "ONLINE", "COD", "SPLIT"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending"
    },

    paymentHistory: [{
        method: {
            type: String,
            enum: ["CASH", "UPI", "CARD", "NETBANKING", "ONLINE"]
        },
        amount: Number,
        transactionId: String,
        paymentGateway: String,
        paidAt: {
            type: Date,
            default: Date.now
        }
    }],

    // =====================
    // PRICE
    // =====================

    subTotal: { type: Number, required: true },

    discountAmount: { type: Number, default: 0 },

    couponCode: String,

    shippingCharge: { type: Number, default: 0 },

    gstAmount: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },

    // =====================
    // STATUS
    // =====================

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
            "Completed", 
            "Returned",
            "Refunded"
        ],
        default: "Pending"
    },

    billingStatus: {
        type: String,
        enum: ["Draft", "Completed", "Cancelled"],
        default: "Completed"
    },

    statusHistory: [{
        status: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        remarks: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // =====================
    // DELIVERY
    // =====================

    trackingNumber: String,

    courierPartner: String,

    shippedAt: Date,

    deliveredAt: Date,

    expectedDeliveryDate: Date,

    // =====================
    // BILLING
    // =====================

    invoicePrinted: {
        type: Boolean,
        default: false
    },

    invoiceDate: Date,

    stockUpdated: {
        type: Boolean,
        default: false
    },

    // =====================
    // OTHER
    // =====================

    cancelReason: String,

    returnReason: String,

    notes: String

}, {
    timestamps: true
});

module.exports =
    mongoose.models.Order ||
    mongoose.model("Order", orderSchema);