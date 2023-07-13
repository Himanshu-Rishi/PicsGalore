const mongoose = require("mongoose");
const productschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of the product!"],
  },
  price: {
    type: Number,
    required: [true, "Please enter the price of the product!"],
    maxLength: [6, "Price cannot exceeded more!"],
  },
  images: [{
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  }],
  category: {
    type: "string",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Product", productschema);
