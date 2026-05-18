const Cart = require("../Models/Cart");
const Product = require("../Models/Product");
const GoldRate = require("../Models/Goldrate");



/*
ADD TO CART
*/
exports.addToCart = async (req, res) => {
  try {
    const {
      user,
      product,
      variantId,
      quantity
    } = req.body;

    const productData =
      await Product.findById(product);

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const selectedVariant =
      productData.variants.id(variantId);

    if (!selectedVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found"
      });
    }

    let cart =
      await Cart.findOne({ user });

    if (!cart) {
      cart = new Cart({
        user,
        items: []
      });
    }

    cart.items.push({
      product,
      variantId,
      quantity
    });

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};






/*
GET CART
*/
exports.getCart = async (req, res) => {
  try {

    const goldRate =
      await GoldRate.findOne()
        .sort({ createdAt: -1 });

    const cart =
      await Cart.findOne({
        user: req.params.userId
      })
      .populate("items.product");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const cartItems =
      cart.items.map((item) => {

        const product =
          item.product;

        const selectedVariant =
          product.variants.id(
            item.variantId
          );

        if (!selectedVariant) {
          return null;
        }

        const goldCost =
          (selectedVariant.weight || 0) *
          goldRate.ratePerGram;

        const variantTotalPrice =
          goldCost +
          (selectedVariant.makingCharges || 0) +
          (selectedVariant.diamondPrice || 0);

        const discountAmount =
          (variantTotalPrice *
            (selectedVariant.discountPercentage || 0)) / 100;

        const finalPrice =
          variantTotalPrice -
          discountAmount;

        const totalPrice =
          finalPrice *
          item.quantity;

        return {
          cartItemId:
            item._id,

          productName:
            product.name,

          image:
            product.images[0],

          selectedVariant: {
            ...selectedVariant.toObject(),

            goldRatePerGram:
              goldRate.ratePerGram,

            goldCost,

            totalPrice:
              variantTotalPrice,

            finalPrice
          },

          quantity:
            item.quantity,

          totalPrice
        };
      }).filter(Boolean);

    res.status(200).json({
      success: true,
      message:
        "Cart fetched successfully",

      cartId:
        cart._id,

      items:
        cartItems
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
UPDATE CART ITEM
*/
exports.updateCartItem = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { quantity } =
      req.body || {};

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity is required"
      });
    }

    const cart =
      await Cart.findById(
        req.params.cartId
      );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message:
          "Cart not found"
      });
    }

    const item =
      cart.items.id(
        req.params.itemId
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Cart item not found"
      });
    }

    item.quantity =
      Number(quantity);

    await cart.save();

    res.status(200).json({
      success: true,
      message:
        "Cart updated successfully",
      data: cart
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
REMOVE CART ITEM
*/
exports.removeCartItem = async (req, res) => {
  try {
    const cart =
      await Cart.findById(req.params.cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items =
      cart.items.filter(
        (item) =>
          item._id.toString() !==
          req.params.itemId
      );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/*
CLEAR CART
*/
exports.clearCart = async (req, res) => {
  try {
    const cart =
      await Cart.findOne({
        user: req.params.userId
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};