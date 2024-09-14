if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
    }
const express = require("express");
const app = express();
const mongoose = require("mongoose");  
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/ExpressErr.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js"); //  user routes
const { log } = require('console');

const dbUrl = process.env.DB_URL;

// MongoDB connection
main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

// Set up view engine and middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Fixed __dirname reference
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); // Fixed __dirname reference


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

// Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // Security purposes
    },
};

store.on("error",() =>{
    console.log("Error in mongodb section");
    
})



app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Route handlers
app.use("/listings", listingsRouter);
app.use("/:id/:reviewId", reviewsRouter); // Changed route to match typical pattern
app.use("/", userRouter); // Use the user router for root-related routes


// Handle 404 errors
// app.use((req, res, next) => {
//     if (!req.route) {
//         next(new ExpressError(404, "Page not found"));
//     } else {
//         next();
//     }
// });


// Error handler
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong" } = err;
//     res.status(statusCode).render("Error.ejs", { message });
// });

// Start server
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});