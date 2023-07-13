const Errorhandler = require("../utils/errorhandler");

// error handler for simple error
const simple_error = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message || "Internal Server Error";
  if (err.name === "CastError") {
    err.message = `Resource not found. Invalid ${err.path}`;
    err = new Errorhandler(err.message, 400);
  }
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyvalue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "sonwebTokenError'") {
    const message = "Json Web Token is invalid, Try again";
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is Expired, Try again";
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
module.exports = simple_error;
