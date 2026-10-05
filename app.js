const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
if(process.env.NODE_ENV !== "production") {
require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//  const dbUrl = "mongodb://127.0.0.1:27017/wonderlust";
const dbUrl = process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to DB");
}

main().catch((err) => {
    console.log("MongoDB ERROR:", err);
});
// const dbUrl = process.env.ATLASDB_URL;
// console.log("DB URL IS", dbUrl);
// main().then(() =>{
//     console.log("connected to DB");
// }).catch((err) =>{
//     console.log(err);
// });
// async function main(){
//     await mongoose.connect(dbUrl);
// }

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(express.urlencoded({extended: true}));  
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie : {
       expire: Date.now() + 1000 * 60 * 60 * 24 * 3,
       maxAge : 1000 * 60 * 60 * 24 * 3,
       httpOnly: true
    }
};

// app.get("/", (req, res) => {
//     res.send("hi i am root");
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all(/(.*)/, (req, res, next) =>{
    next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) =>{
    let {status = 500, message = "something went wrong"} = err;
    res.status(status).render("error.ejs", { message });
    // res.status(status).send(message); 
})
app.listen(8080, () =>{
    console.log("app is lintening on port 8080");
})