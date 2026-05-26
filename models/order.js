const mongoose = require("mongoose");


// =========================
// ORDER ITEM SCHEMA
// =========================

const orderItemSchema =

    new mongoose.Schema({

        product: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Product",

            required: true

        },

        variantId: {

            type:
                mongoose.Schema.Types.ObjectId,

            required: true

        },

        quantity: {

            type: Number,

            default: 1

        },

        // =========================
        // PRODUCT SNAPSHOT
        // =========================

        name: {
            type: String
        },

        image: {
            type: String
        },

        productType: {
            type: String
        },

        category: {
            type: String
        },

        // =========================
        // VARIANT SNAPSHOT
        // =========================

        size: {
            type: String
        },

        goldPurity: {
            type: String
        },

        goldColor: {
            type: String
        },

        grossWeight: {
            type: Number
        },

        netWeight: {
            type: Number
        },

        makingCharges: {
            type: Number
        },

        wastagePercentage: {
            type: Number
        },

        hasDiamond: {
            type: Boolean,
            default: false
        },

        diamonds: [
            {
                diamondType: String,
                shape: String,
                carat: Number,
                color: String,
                clarity: String,
                cut: String,
                certificateLab: String,
                certificateNumber: String,
                diamondPrice: Number,
                totalDiamonds: Number
            }
        ],

        // =========================
        // PRICE SNAPSHOT
        // =========================

        goldRatePerGram: {
            type: Number
        },

        goldCost: {
            type: Number
        },

        totalDiamondPrice: {
            type: Number
        },

        totalPrice: {
            type: Number
        },

        discountPercentage: {
            type: Number
        },

        discountAmount: {
            type: Number
        },

        finalPrice: {
            type: Number
        }

    }, {
        _id: false
    });

// =========================
// ADDRESS SCHEMA
// =========================

const addressSchema =

    new mongoose.Schema({

        fullName: {
            type: String
        },

        mobile: {
            type: String
        },

        alternateMobile: {
            type: String
        },

        houseNo: {
            type: String
        },

        area: {
            type: String
        },

        landmark: {
            type: String
        },

        city: {
            type: String
        },

        state: {
            type: String
        },

        pincode: {
            type: String
        },

        country: {
            type: String,
            default: "India"
        }

    }, {
        _id: false
    });

// =========================
// ORDER SCHEMA
// =========================

const orderSchema =

    new mongoose.Schema({

        // =========================
        // USER
        // =========================

        user: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        // =========================
        // ORDER ID
        // =========================

        orderId: {

            type: String,

            unique: true

        },

        // =========================
        // PRODUCTS
        // =========================

        items: [
            orderItemSchema
        ],

        // =========================
        // ADDRESS
        // =========================

        shippingAddress:
            addressSchema,

        // =========================
        // PAYMENT
        // =========================

        paymentMethod: {

            type: String,

            enum: [
                "COD",
                "RAZORPAY",
                "STRIPE",
                "UPI"
            ],

            default: "COD"

        },

        paymentStatus: {

            type: String,

            enum: [
                "PENDING",
                "PAID",
                "FAILED",
                "REFUNDED"
            ],

            default: "PENDING"

        },

        transactionId: {

            type: String
        },

        // =========================
        // ORDER STATUS
        // =========================

        orderStatus: {

            type: String,

            enum: [

                "PLACED",

                "CONFIRMED",

                "PROCESSING",

                "SHIPPED",

                "OUT_FOR_DELIVERY",

                "DELIVERED",

                "CANCELLED"

            ],

            default: "PLACED"

        },

        // =========================
        // PRICE SUMMARY
        // =========================

        subtotal: {

            type: Number,

            default: 0

        },

        shippingCharge: {

            type: Number,

            default: 0

        },

        discount: {

            type: Number,

            default: 0

        },

        totalAmount: {

            type: Number,

            default: 0

        },

        // =========================
        // DELIVERY
        // =========================

        estimatedDeliveryDate: {
            type: Date
        },

        deliveredAt: {
            type: Date
        }

    }, {

        timestamps: true

    });

module.exports =

    mongoose.models.Order ||

    mongoose.model(
        "Order",
        orderSchema
    );