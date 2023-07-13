const Errorhandler = require("../utils/errorhandler");
const async_error = require("../middleware/catchasyncerror");
const User = require("../model/usermodel");
const crypto = require("crypto");
const sendToken = require("../utils/token");
const { sendEmail } = require("../utils/sendEmail");
const cloudinary = require("cloudinary");

exports.registerUser = async_error(async (req, res, next) => {
  if (req.body.avatar) {
    const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "AvatarPics",
      width: 150,
      crop: "scale",
    });
    const { name, email, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      password,
      role,
    });
    sendToken(user, 201, res);
  } else {
    const { name, email, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      avatar: {
        public_id: "Default_Profile",
        url: "https://res.cloudinary.com/dwtntbtvy/image/upload/v1689241731/AvatarPics/user-2_pjgegi_yenzux.png",
      },
      password,
      role,
    });
    sendToken(user, 201, res);
  }
});

exports.loginUser = async_error(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Errorhandler("Please enter credential...!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new Errorhandler("Please enter correct credential...!", 401));
  }
  const ispasswordmatched = await user.comparePassword(password);
  if (!ispasswordmatched) {
    return next(new Errorhandler("Please enter correct credential...!", 401));
  }
  sendToken(user, 200, res);
});

exports.logoutUser = async_error(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };
  res.cookie("token", null, options);

  res.status(200).json({
    success: true,
    msg: "Logged Out",
  });
});

exports.forgetPassword = async_error(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Errorhandler("User not found...!", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message: message,
      name: user.name,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new Errorhandler(error.message, 500));
  }
});

exports.resetPassword = async_error(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new Errorhandler(
        "Reset Password Token is invalid or has been expired...!",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new Errorhandler("Password does not match...!", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

exports.getUserDetail = async_error(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateUserPassword = async_error(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const ispasswordmatched = await user.comparePassword(req.body.oldPassword);
  if (!ispasswordmatched) {
    return next(new Errorhandler("Old Password is incorrect...!", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new Errorhandler("Password does not match...!", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.updateProfile = async_error(async (req, res, next) => {
  const newuserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // uncomment it if you want to update profile avatar
  
  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);
  //   const imageId = user.avatar.public_id;
  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const mycloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "AvatarPics",
  //     width: 150,
  //     crop: "scale",
  //   });
  //   newuserData.avatar = {
  //     public_id: mycloud.public_id,
  //     url: mycloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newuserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

exports.getUser = async_error(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.getSingleUser = async_error(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return new Errorhandler("User does not exist", 404);
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateRole = async_error(async (req, res, next) => {
  const newUserDate = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserDate, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

exports.deleteUser = async_error(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return new Errorhandler("User does not exist", 404);
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    msg: "Deleted Successfully",
  });
});
