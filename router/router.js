const express = require("express");
const router = express.Router();

// router.post("/upload", upload.single("image"), uploadImage);



const { register, login, forgotPassword, resetPassword } = require('../controllers/user.controller');
const { createGoldRate, getAllGoldRates, getGoldRateById, updateGoldRate, deleteGoldRate } = require("../controllers/goldrate.controller");
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require("../controllers/category.controller");
const { getSubCategoryByCategory, createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } = require("../controllers/subcategory.controller");
const { getSubSubCategoryBySubCategory, createSubSubCategory, getAllSubSubCategories, getSubSubCategoryById, updateSubSubCategory, deleteSubSubCategory } = require("../controllers/subsubcategory.controller");
const { createProduct, getAllProducts, getAllProductsWithPagination, getProductsByType, getProductById, updateProduct, deleteProduct, getProductsByCategory } = require("../controllers/product.controller");
const { getAllUsers, getUsersCount, getProfileSummary, userLogout, Userregister, userLogin, userforgotPassword, verifyOTP, resendOTP, userresetPassword } = require("../controllers/userlogin.controller");
const { addToCart, getCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cart.controller");
const { addToWishlist, getWishlist, removeWishlistItem } = require("../controllers/wishlist.controller");
const { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress, getAllAddresses } = require("../controllers/address.controller");
const { createBanner, updateBanner, getAllBanners, deleteBanner } = require("../controllers/banner.controller");
const { createContact, getAllContacts, getContactById, updateContact, deleteContact } = require("../controllers/contact.controller");
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } = require("../controllers/coupon.controller");
const { createReview, getAllReviews, getReviewById, getProductReviews, updateReview, deleteReview } = require("../controllers/review.controller");


const upload = require("../middleware/upload");

const {
  uploadCertificate
} = require(
  "../controllers/upload.controller"
);


router.post("/create-contact", createContact);
router.get("/getall-contact", getAllContacts);
router.post("/getbyid-contact/:id", getContactById);
router.put("/update-contact/:id", updateContact);
router.delete("/delete-contact/:id", deleteContact);



router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// gold Rate

router.post("/gold-rate", createGoldRate);
router.get("/gold-rate", getAllGoldRates);
router.get("/gold-rate/:id", getGoldRateById);
router.put("/gold-rate/:id", updateGoldRate);
router.delete("/gold-rate/:id", deleteGoldRate);

router.post('/create-category', upload.single('image'), createCategory);
router.get("/getallcategory", getAllCategories);
router.get("/getbyIdcategory/:id", getCategoryById);
router.put("/updatecategory/:id", upload.single("image"), updateCategory);
router.delete("/deletecategory/:id", deleteCategory);

router.post("/Cretesubcategory", upload.single("image"), createSubCategory);
router.get("/getbyIdsubcategory/:id", getSubCategoryById);
router.get("/Getsubcategory", getAllSubCategories);
router.put("/Updatesubcategory/:id", upload.single("image"), updateSubCategory);
router.delete("/Deletesubcategory/:id", deleteSubCategory);
router.get("/get-subcategoryby-category/:categoryId", getSubCategoryByCategory);


router.post("/Create-sub-subcategory", upload.single("image"), createSubSubCategory);
router.get("/get-subsubcategory", getAllSubSubCategories);
router.get("/getById-subsubcategory/:id", getSubSubCategoryById);
router.put("/Update_subsubcategory/:id", upload.single("image"), updateSubSubCategory);
router.delete("/subsubcategory/:id", deleteSubSubCategory);
router.get("/get-subsubcategorybysubcategory/:subCategoryId", getSubSubCategoryBySubCategory);


router.post("/create-product", upload.fields([{ name: "images", maxCount: 10 }, { name: "certificate", maxCount: 1 }, { name: "video", maxCount: 1 }]), createProduct);
router.put("/update-product/:id", upload.fields([{ name: "images", maxCount: 10 }, { name: "video", maxCount: 1 }, { name: "certificate", maxCount: 5 }]), updateProduct);
router.get("/getAllProducts", getAllProducts);
router.get('/getProductsByType/:type', getProductsByType);
router.get("/products", getAllProductsWithPagination);
router.get("/get-product/:id", getProductById);
router.delete("/Deleteproduct/:id", deleteProduct);
router.get("/getProductsByCategory", getProductsByCategory);

router.post(
  "/upload-certificate",
  upload.single("file"),
  uploadCertificate
);


// router.post("/createProduct",upload.array("images", 10),createProduct);
// router.get("/getAllProducts",getAllProducts);
// router.put("/UpdateProduct/:id",upload.array("images", 10),updateProduct);

router.post("/userregister", Userregister);
router.post("/userlogin", userLogin);
router.post("/user-forgot-password", userforgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/user-reset-password", userresetPassword);
router.get("/getAllUsers", getAllUsers);
router.get("/getUsersCount", getUsersCount);
router.get("/profileSummary/:userId", getProfileSummary);
router.post("/logout", userLogout);



router.post("/addcart", addToCart);
router.get("/getcart/:userId", getCart);
router.put("/updateCartQuantity/:cartId/item/:itemId", updateCartItem);
router.delete("/removeCart/:cartId/item/:itemId", removeCartItem);
router.delete("/clearCart/clear/:userId", clearCart);



router.post("/wishlist", addToWishlist);
router.get("/wishlist/:userId", getWishlist);
router.delete("/wishlist/:wishlistId/item/:itemId", removeWishlistItem);

router.post("/Createaddress", createAddress);
router.get("/address/:userId", getAddresses);
router.get("/addressbyid/:id", getAddressById);
router.put("/updateaddress/:id", updateAddress);
router.delete("/Deleteaddress/:id", deleteAddress);
router.get("/getAllAddress", getAllAddresses);


router.post("/create-coupon", createCoupon);
router.get("/getall-coupon", getAllCoupons);
router.get("/getbyid-coupon/:id", getCouponById);
router.put("/updatecoupon/:id", updateCoupon);
router.delete("/Deletecoupon/:id", deleteCoupon);


// router.post("/create-review",createReview);
router.post("/create-review", upload.fields([{ name: "images", maxCount: 10 }, { name: "videos", maxCount: 2 }]), createReview);

router.get("/getall-review", getAllReviews);
router.get("/getbyid-review/:id", getReviewById);
router.get("/product-reviews/:productId", getProductReviews);
router.put("/update-review/:id", updateReview);
router.delete("/delete-review/:id", deleteReview);

/*
CREATE
*/
router.post("/createBanner", upload.single("image"), createBanner);
router.get("/getAllBanners", getAllBanners);
router.delete("/deleteBanner/:id", deleteBanner);
router.put("/updateBanner/:id", upload.single("image"), updateBanner);

module.exports = router;
