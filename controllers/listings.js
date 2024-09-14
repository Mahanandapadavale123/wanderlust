const { request } = require("express");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.PUBLIC_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });




module.exports.index = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Error fetching listings", err);
        res.status(500).send("Failed to fetch listings");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs"); // render the new form template
};


module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
          path: 'author',
          model: 'User'
      }
    })
    
    if(!listing){
      req.flash("error", "listing you requested for does not exists");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  };

  module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
      limit: 2
    })
      .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename} ;
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    
    req.flash("success", " new listing created");
    res.redirect("/listings");
  };

  module.exports.renderEdit = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "  listing  you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  
  };

  module.exports.updateRoute = async (req, res) => {
    let { id } = req.params
  // Ensure the ID is valid and trimmed
  // const trimmedId = id.trim();
  // if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
  //     throw new ExpressError(400, "Invalid ID format");
  // }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", " listing was updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", " listing deleted");
    res.redirect("/listings");
  }
