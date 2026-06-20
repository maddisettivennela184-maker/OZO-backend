const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user-login");
const Address = require("../models/address");

exports.createOrder = async (req, res) => {

  try {

    const {
      user,
      address,
      paymentMethod,
      items,
      subTotal,
      discountAmount,
      shippingCharge,
      gstAmount,
      totalAmount,
      notes
    } = req.body;

    // =====================
    // USER CHECK
    // =====================

   const userData =
  await User.findOne({
    _id: user
  });

console.log(userData);

    if (!userData) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }

    // =====================
    // ADDRESS CHECK
    // =====================

    const addressData =
      await Address.findById(address);

    if (!addressData) {

      return res.status(404).json({

        success: false,

        message:
          "Address not found"

      });

    }

    // =====================
    // ORDER NUMBER
    // =====================

    const count =
      await Order.countDocuments();

    const orderNumber =
      `ORD${1001 + count}`;

    let orderItems = [];

    // =====================
    // ITEMS LOOP
    // =====================

    for (const item of items) {

      const product =
        await Product.findById(
          item.product
        );

      if (!product) {

        return res.status(404).json({

          success: false,

          message:
            "Product not found"

        });

      }

      const variant =
        product.variants.find(

          v =>
            v._id.toString() ===
            item.variant

        );

      if (!variant) {

        return res.status(404).json({

          success: false,

          message:
            "Variant not found"

        });

      }

      orderItems.push({

        product:
          product._id,

        variant:
          variant._id,

        productSnapshot: {

          name:
            product.name,

          slug:
            product.slug,

          image:
            product.images?.[0],

          category:
            product.category,

          subCategory:
            product.subCategory

        },

        variantSnapshot: {

          sku:
            variant.sku,

          purity:
            variant.metalPurity,

          size:
            variant.size,

          grossWeight:
            variant.grossWeight,

          netWeight:
            variant.netWeight,

          makingCharge:
            variant.makingCharges,

          stoneType:
            variant.stones?.[0]
              ?.stoneType

        },

        quantity:
          item.quantity,

        unitPrice:
          item.unitPrice,

        totalPrice:
          item.totalPrice

      });

    }

    // =====================
    // CREATE ORDER
    // =====================

    const order =
      await Order.create({

        orderNumber,

        user,

        address,

        paymentMethod,

        items:
          orderItems,

        addressSnapshot: {

          fullName:
            addressData.fullName,

          phone:
            addressData.phone,

          addressLine1:
            addressData.addressLine1,

          addressLine2:
            addressData.addressLine2,

          city:
            addressData.city,

          state:
            addressData.state,

          country:
            addressData.country,

          postalCode:
            addressData.pincode

        },

        subTotal,

        discountAmount,

        shippingCharge,

        gstAmount,

        totalAmount,

        notes

      });

    res.status(201).json({

      success: true,

      message:
        "Order created successfully",

      data:
        order

    });

  }
  catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

exports.getAllOrders = async (req, res) => {

  try {

    const orders =
      await Order.find()

      .populate("user")

      .populate("address")

      .populate("items.product");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getOrderById = async (req, res) => {

  try {

    const order =
      await Order.findById(req.params.id)

      .populate("user")

      .populate("address")

      .populate("items.product");

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getOrdersByUser = async (req, res) => {

  try {

    const orders =
      await Order.find({
        user: req.params.userId
      })

      .populate("items.product")

      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
exports.updateOrderStatus = async (req, res) => {

  try {

    const order =
      await Order.findByIdAndUpdate(

        req.params.id,

        {
          orderStatus:
            req.body.orderStatus
        },

        {
          new: true
        }

      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.updatePaymentStatus = async (req, res) => {

  try {

    const order =
      await Order.findByIdAndUpdate(

        req.params.id,

        {
          paymentStatus:
            req.body.paymentStatus,

          transactionId:
            req.body.transactionId
        },

        {
          new: true
        }

      );

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.cancelOrder = async (req, res) => {

  try {

    const order =
      await Order.findByIdAndUpdate(

        req.params.id,

        {
          orderStatus: "Cancelled",
          cancelReason:
            req.body.cancelReason
        },

        {
          new: true
        }

      );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
exports.deleteOrder = async (req, res) => {

  try {

    const order =
      await Order.findByIdAndDelete(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};