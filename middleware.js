const Listing = require("./models/listing");
const Review = require("./models/review.js")
const ExpressError = require("./util/ExpressErr.js");
const{listingSchema , reviewSchema } = require("./Schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must logged in WanderLust");
    return res.redirect("/login");
  }

  next();
};

module.exports.saveRedirectUrl = (req, res, next) =>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async(req, res, next) =>{
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currentUser._id)){
    req.flash("error", "you don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing =(req, res, next) =>{
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400,msg);
  }else{
    next();
  }
};

//validate review

module.exports.validateReview =(req, res, next) =>{
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400,msg);
    }else{
      next();
    }
  };

  module.exports.isReviewAuthor = async(req, res, next) =>{
    const {id, reviewId } = req.params;
    let review = await Listing.findById(id);
    if(!review.author.equals(res.locals.currentUser._id)){
      req.flash("error", "you don't have permission to edit");
      return res.redirect(`/listings/${id}`);
    }
    next();
  };
  