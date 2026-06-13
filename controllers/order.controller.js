const Order = require("../models/order");

exports.createOrder = async (req, res) => {

  try {

    const {
      orderNumber,
      user,
      items,
      address,
      paymentMethod,
      subTotal,
      totalAmount
    } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required"
      });
    }

    const existingOrder =
      await Order.findOne({
        orderNumber
      });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order Number already exists"
      });
    }

    const order =
      await Order.create(req.body);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
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