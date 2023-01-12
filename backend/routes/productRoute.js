const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductDetails, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReviews, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser, autherizeRoles } = require('../middleware/auth');




router.post("/admin/product/new", isAuthenticatedUser, autherizeRoles("admin"), createProduct);

router.get("/products", getAllProducts);

router.get("/admin/products", isAuthenticatedUser, autherizeRoles("admin"), getAdminProducts);

router.get("/product/:id", getProductDetails);

router.put("/admin/product/:id", isAuthenticatedUser, autherizeRoles("admin"), updateProduct);

router.delete("/admin/product/:id", isAuthenticatedUser, autherizeRoles("admin"), deleteProduct);

router.put("/review", isAuthenticatedUser, createProductReview);

router.get("/reviews", getProductReviews);

router.delete("/reviews", isAuthenticatedUser, deleteReviews);




module.exports = router;