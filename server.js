/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute"); // Added accountRoute
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities"); // Added utilities for nav generation
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser"); // Added body-parser

/* ***********************
 * Middleware
 *************************/
// Session Configuration
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

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body-Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", accountRoute); // Added accountRoute

// Error routes
app.use("/error", errorRoute);

/* ***********************
 * Global Error Handling Middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging

  // Generate navigation HTML
  const nav = await utilities.getNav();

  res.status(err.status || 500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    nav, // Pass nav to the error view
  });
});

/* ***********************
 * Handle 404 Errors
 *************************/
app.use(async (req, res, next) => {
  // Generate navigation HTML
  const nav = await utilities.getNav();

  res.status(404).render("error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
    nav, // Pass nav to the 404 view
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000; // Added fallback default values
const host = process.env.HOST || "localhost";

/* ***********************
 * Start the Server
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
