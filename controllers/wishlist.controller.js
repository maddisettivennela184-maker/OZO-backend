const Wishlist =
  require("../models/wishlist");

const Product =
  require("../models/product");

  const GoldRate =
  require("../models/goldRate");


/*
ADD TO WISHLIST
*/
exports.addToWishlist =
  async (req, res) => {
    try {
      const {
        user,
        product,
        variantId
      } = req.body;

      if (!user || !product) {
        return res.status(400).json({
          success: false,
          message:
            "User and Product are required"
        });
      }

      const productExists =
        await Product.findById(
          product
        );

      if (!productExists) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found"
        });
      }

      let wishlist =
        await Wishlist.findOne({
          user
        });

      if (!wishlist) {
        wishlist =
          new Wishlist({
            user,
            items: []
          });
      }

      const alreadyExists =
        wishlist.items.find(
          (item) =>
            item.product.toString() ===
              product &&
            item.variantId?.toString() ===
              variantId
        );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message:
            "Product already in wishlist"
        });
      }

      wishlist.items.push({
        product,
        variantId
      });

      await wishlist.save();

      res.status(201).json({
        success: true,
        message:
          "Added to wishlist successfully",
        data: wishlist
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
GET WISHLIST
*/
exports.getWishlist =
  async (req, res) => {
    try {
      const goldRate =
        await GoldRate.findOne()
          .sort({ createdAt: -1 });

      const wishlist =
        await Wishlist.findOne({
          user: req.params.userId
        })
        .populate("items.product");

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found"
        });
      }

      const wishlistItems =
        wishlist.items.map((item) => {

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

          const totalPrice =
            goldCost +
            (selectedVariant.makingCharges || 0) +
            (selectedVariant.diamondPrice || 0);

          const discountAmount =
            (totalPrice *
              (selectedVariant.discountPercentage || 0)) / 100;

          const finalPrice =
            totalPrice -
            discountAmount;

          return {
            wishlistItemId:
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

              totalPrice,

              finalPrice
            }
          };
        }).filter(Boolean);

      res.status(200).json({
        success: true,
        message:
          "Wishlist fetched successfully",

        wishlistId:
          wishlist._id,

        items:
          wishlistItems
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.removeWishlistItem =
  async (req, res) => {
    try {
      const wishlist =
        await Wishlist.findById(
          req.params.wishlistId
        );

      if (!wishlist) {
        return res.status(404).json({
          success: false,
          message:
            "Wishlist not found"
        });
      }

      const item =
        wishlist.items.id(
          req.params.itemId
        );

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Wishlist item not found"
        });
      }

      wishlist.items =
        wishlist.items.filter(
          (item) =>
            item._id.toString() !==
            req.params.itemId
        );

      await wishlist.save();

      res.status(200).json({
        success: true,
        message:
          "Wishlist item removed successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };