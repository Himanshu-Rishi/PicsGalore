const express = require("express");
const router = express.Router();
const { isAuthenticated, isauthorized } = require("../middleware/auth");
const {
  newOrder,
  getOrderDetails,
  getLoggedInOrder,
  getAllOrderDetails,
  deleteOrder,
  updateOrder,
} = require("../controller/ordercontroller");

router.route("/order/new").post(isAuthenticated, newOrder);
router.route("/order/:id").get(isAuthenticated, getOrderDetails);
router.route("/myorders").get(isAuthenticated, getLoggedInOrder);

router
  .route("/admin/orders")
  .get(isAuthenticated, isauthorized("admin"), getAllOrderDetails);
router
  .route("/admin/order/:id")
  .put(isAuthenticated, isauthorized("admin"), updateOrder)
  .delete(isAuthenticated, isauthorized("admin"), deleteOrder);

module.exports = router;
