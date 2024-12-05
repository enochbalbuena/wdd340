const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities");
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser")

app.use(cookieParser())
app.use(utilities.checkJWTToken)

// Session Middleware
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Flash Middleware
app.use(flash());

// Middleware to attach flash messages just before rendering
app.use((req, res, next) => {
  res.locals.flashMessages = {}; // Initialize flashMessages
  next();
});

// Body-Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static Files
app.use(express.static("public"));

/* View Engine and Layouts */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* Routes */
app.use(static);
app.get("/", baseController.buildHome);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/error", errorRoute);
app.get('/test-flash', (req, res) => {
  req.flash('success', 'Flash messages are working!');
  res.redirect('/inv/management');
});

// Flash middleware
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash(); // Ensure flash messages exist globally
  console.log("Middleware Flash Messages:", res.locals.flashMessages);
  next();
});


/* Error Handling */
app.use(async (err, req, res, next) => {
  let nav = "";
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error("Error generating navigation:", navError);
  }
  console.error("Error:", err.stack);
  res.status(err.status || 500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    nav,
  });
});

/* 404 Handling */
app.use(async (req, res, next) => {
  let nav = "";
  try {
    nav = await utilities.getNav();
  } catch (navError) {
    console.error("Error generating navigation:", navError);
  }
  res.status(404).render("error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
    nav,
  });
});

/* Start the Server */
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
