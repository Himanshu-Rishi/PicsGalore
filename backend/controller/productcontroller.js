const Product = require("../model/productmodel");
const Errorhandler = require("../utils/errorhandler");
const async_error = require("../middleware/catchasyncerror");
const cloudinary = require("cloudinary");
const ApiFeatures = require("../utils/apifeatures");

// controllers for users

// getting product by searching and using filters
exports.getallproducts = async_error(async (req, res, next) => {
  const itemPerPage = 12;
  const productCount = await Product.countDocuments();
  const apifeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();
  let products = await apifeature.query;
  let filteredProductsCount = products.length;
  apifeature.pagination(itemPerPage);
  products = await apifeature.query.clone();
  res.status(200).json({
    success: true,
    products,
    productCount,
    itemPerPage,
    filteredProductsCount,
  });
});

exports.getproducts = async_error(async (req, res, next) => {
  const product_id = req.params.id;
  const product = await Product.findById(product_id);
  if (product) {
    res.status(201).send({ success: true, product});
  } else {
    return next(new Errorhandler("Product not found...!", 404));
  }
});


// controllers for vendors

exports.createproductbyvendor = async_error(async (req, res, next) => {

  // uncomment for frontend part while uploading images.
  
  // let images = [];
  // if (typeof(req.body.images) === "string") {
  //   images.push(req.body.images);
  // } else {
  //   images = req.body.images;
  // }
    // images.push(req.body.images);


  // const imagesLink = [];

  // for (let i = 0; i < images.length; i++) {
  //   const result = await cloudinary.v2.uploader.upload(images[i], {
  //     folder: "PicsGalore",
  //   });
  //   imagesLink.push({
  //     public_id: result.public_id,
  //     url: result.secure_url,
  //   });
  // }
  // req.body.images = imagesLink;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  return res.status(200).json({ success: true, product });
});

// admin routes

exports.getAdminproducts = async_error(async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products
  });
});

exports.createproducts = async_error(async (req, res) => {
  let images = [];
  if(typeof req.body.images === "string")
  {
    images.push(req.body.images);
  }
  else
  {
    images = req.body.images;
  } 

  const imagesLink = [];

  for(let i = 0; i < images.length; i++)
  {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });
    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.images = imagesLink;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  return res.status(200).json({ success: true, product });
});

exports.updateproducts = async_error(async (req, res, next) => {
  const product_id = req.params.id;
  const body = req.body;
  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }
  const product = await Product.findByIdAndUpdate(product_id, body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  if (!product) {
    return next(new Errorhandler("Product not found...!", 404));
  }
  res.status(201).send({ success: true, product });
});

exports.deleteproducts = async_error(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Errorhandler("Product not found", 404));
  }

  for(let i = 0; i < product.images.length; i++)
  {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id)
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
  });
});