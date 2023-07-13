const express = require('express');
const { getallproducts, createproducts, updateproducts, deleteproducts, getproducts, createProductReview, getAllReview, deleteReview, getCategoryProduct, getAdminproducts, getProductReviews, createproductbyvendor } = require('../controller/productcontroller');
const { isAuthenticated, isauthorized } = require('../middleware/auth');
const router = express.Router();

// user routes
router.route("/products").get(getallproducts);
router.route("/product/:id").get(getproducts);

// vendor routes
router.route("/create/product").post(isAuthenticated,isauthorized("vendor"),createproductbyvendor);

// admin routes
router.route("/admin/product/add").post(isAuthenticated, isauthorized("admin"), createproducts);
router.route("/admin/product/:id").put(isAuthenticated, isauthorized("admin"), updateproducts);
router.route("/admin/product/:id").delete(isAuthenticated, isauthorized("admin"), deleteproducts);
router.route("/admin/products").get(isAuthenticated, isauthorized("admin"), getAdminproducts);

module.exports = router