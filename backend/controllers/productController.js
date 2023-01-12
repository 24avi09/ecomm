const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require('../middleware/catchAsync');
const ApiFeatures = require('../utils/apifeatures')
const cloudinary = require('cloudinary');



//create product --> Admin

createProduct = catchAsyncErrors(async (req, res, next) => {

    let images = [];

    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: (await result).public_id,
            url: (await result).secure_url,
        })
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).send({ success: true, product })

})


//get all products

getAllProducts = catchAsyncErrors(async (req, res) => {

    const resultPerPage = 5;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter();

    let products = await apiFeatures.query;

    let filteredProductsCount = products.length;

    apiFeatures.pagination(resultPerPage)

    products = await apiFeatures.query;


    res.status(200).send({ success: true, products, productsCount, resultPerPage, filteredProductsCount })

});



//get all products --> (Admin)

getAdminProducts = catchAsyncErrors(async (req, res) => {

    const products = await Product.find();

    res.status(200).send({ success: true, products })

});



//get product details

getProductDetails = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    return res.status(200).send({ success: true, product });

});



//Update products --> Admin

updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // Images start here
    let images = [];

    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {

        // Deleting images from cloudinary
        for (let i = 0; i < product.images.length; i++) {

            await cloudinary.v2.uploader.destroy(product.images[i].public_id)

        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
            });

            imagesLinks.push({
                public_id: (await result).public_id,
                url: (await result).secure_url,
            })
        }
        req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).send({ success: true, product });

})



//delete products --> Admin

deleteProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    // Deleting images from cloudinary
    for (let i = 0; i < product.images.length; i++) {

        await cloudinary.v2.uploader.destroy(product.images[i].public_id)

    }

    await product.remove();

    return res.status(200).send({ success: true, message: "Product Deleted Successfully" });

});



//Update products --> Admin

createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    const isReviewed = await product.reviews.find(rev => rev.user.toString() === req.user._id.toString())

    if (isReviewed) {

        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                (rev.rating = rating), (rev.comment = comment);
            }

        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach(rev => { avg += rev.rating });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false })

    res.status(200).send({ success: true })

})


///===  Get All reviews of a product

getProductReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).send({ success: true, reviews: product.reviews })
})


///===  Delete reviews of a product

deleteReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;

    reviews.forEach(rev => { avg += rev.rating })

    let ratings = 0;

    if (ratings === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }


    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })


    res.status(200).send({ success: true })
})


module.exports = { createProduct, getAllProducts, getAdminProducts, getProductDetails, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReviews, }