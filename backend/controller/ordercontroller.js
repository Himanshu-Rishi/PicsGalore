const Order = require("../model/ordermodel");
const Product = require("../model/productmodel");
const async_error = require("../middleware/catchasyncerror");
const Errorhandler = require("../utils/errorhandler");
const ApiFeatures = require("../utils/apifeatures");

exports.newOrder = async_error(async(req, res, next)=>
{
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user.id
    });
    res.status(201).json({
        success: true,
        order
    })
})

exports.getOrderDetails = async_error(async(req, res, next)=>{
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if(!order)
    {
        return next(new Errorhandler("Order not found with this id.", 404));
    }
    res.status(201).json({
      success: true,
      order
    });
})

exports.getAllOrderDetails = async_error(async(req, res, next)=>{
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach(element => {
        totalAmount += orders.totalPrice
    });
    res.status(201).json({
      success: true,
      totalAmount,
      orders,
    });
})

exports.getLoggedInOrder = async_error(async (req, res, next) => {
  const orders = await Order.find({user: req.user.id});

  if (!orders) {
    return next(new Errorhandler("No orders", 404));
  }
  res.status(201).json({
    success: true,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = async_error(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new Errorhandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new Errorhandler("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = async_error(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new Errorhandler("Order not found with this Id", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});
