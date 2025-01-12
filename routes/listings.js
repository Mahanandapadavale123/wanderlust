
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const wrapAsync = require("../util/wrapAsync.js");
const ExpressError = require("../util/ExpressErr.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const{storage} = require("../cloudConfig.js")
const upload = multer({ storage })



// index and create route
router
.route("/")
.get( wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing )
);


//New Route
router.get("/new",
  isLoggedIn,listingController.renderNewForm
  
);

//show Route and Update Route and also Delete Route
router
.route("/:id")
.get(
  wrapAsync(listingController.showListing ))
.put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateRoute))
.delete(
      isLoggedIn,
      isOwner,
      wrapAsync(listingController.deleteListing));

//Edit Route
router.get("/:id/edit", 
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEdit));

module.exports = router;