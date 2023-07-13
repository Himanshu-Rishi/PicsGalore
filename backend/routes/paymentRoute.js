const express = require("express");
const {
  processPayment,
} = require("../controller/paymentcontroller");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticated, processPayment);

module.exports = router;
