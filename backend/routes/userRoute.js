const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, forgetPassword, getUserDetail, resetPassword, updateUserPassword, updateProfile, getSingleUser, updateRole, deleteUser, getUser } = require("../controller/usercontroller");
const { isAuthenticated, isauthorized } = require("../middleware/auth");
// post method
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/profile").get(isAuthenticated, getUserDetail);
router.route("/password/update").put(isAuthenticated, updateUserPassword);
router.route("/profile/update").put(isAuthenticated, updateProfile);

router.route("/admin/users").get(isAuthenticated, isauthorized("admin"), getUser);
router.route("/admin/user/:id").get(isAuthenticated, isauthorized("admin"), getSingleUser);
router.route("/admin/user/:id").put(isAuthenticated, isauthorized("admin"), updateRole);
router.route("/admin/user/:id").delete(isAuthenticated, isauthorized("admin"), deleteUser);
module.exports = router