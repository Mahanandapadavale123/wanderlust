const express = require('express');
const router = express.Router({mergeParams:true});

const wrapAsync = require("../util/wrapAsync.js");
const ExpressError = require("../util/ExpressErr.js");
const{ reviewSchema} =require("../Schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn,isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');

//post Review route
router.post("/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview));

router.delete("/",
    wrapAsync(reviewController.deleteReview));

module.exports = router;
