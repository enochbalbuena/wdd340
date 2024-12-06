const invModel = require("../models/inventory-model");
const pool = require("../database"); // Make sure to import your database pool
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications(); // Fetch classifications
    console.log("Fetched classifications:", data); // Debugging log
    if (!Array.isArray(data)) {
      throw new Error("Expected classifications to be an array.");
    }
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.forEach((row) => {
      if (row.classification_id && row.classification_name) {
        list += "<li>";
        list +=
          '<a href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>";
        list += "</li>";
      }
    });
    list += "</ul>";
    return list;
  } catch (err) {
    console.error("Error generating navigation:", err);
    // Return a default navigation in case of error
    return "<ul><li><a href='/'>Home</a></li></ul>";
  }
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  try {
    let grid = "";
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((vehicle) => {
        grid += `
          <div class="vehicle-card">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
            <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
            <p>Price: $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
            <p>Mileage: ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
            <a href="/inv/detail/${vehicle.inv_id}" class="btn-view-details">View Details</a>
          </div>
        `;
      });
    } else {
      grid = "<p>No vehicles found for this classification.</p>";
    }
    return grid;
  } catch (error) {
    console.error("Error building classification grid:", error);
    throw error;
  }
};

/* ***************************
 *  Build the vehicle detail view HTML
 *************************** */
Util.buildDetailView = function (data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data for vehicle details.");
  }
  return {
    inv_image: data.inv_image,
    inv_make: data.inv_make,
    inv_model: data.inv_model,
    inv_year: data.inv_year,
    inv_price: data.inv_price,
    inv_miles: data.inv_miles,
    inv_color: data.inv_color,
    inv_description: data.inv_description,
  };
};

/* ***************************
 * Build classification dropdown list
 ************************** */
Util.buildClassificationList = async function (selectedId) {
  try {
      const classifications = await pool.query(
          "SELECT * FROM public.classification ORDER BY classification_name"
      );
      let dropdown = "";
      classifications.rows.forEach((classification) => {
          console.log(`Processing classification: ${classification.classification_name}`);
          dropdown += `<option value="${classification.classification_id}" ${
              classification.classification_id == selectedId ? "selected" : ""
          }>${classification.classification_name}</option>`;
      });
      console.log("Generated Dropdown:", dropdown);
      return dropdown;
  } catch (error) {
      console.error("Error building classification list:", error);
      throw error;
  }
};

/* ***************************
 * Handle Errors Wrapper
 *************************** */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    if (typeof fn !== "function") {
      console.error("Error: fn is not a function:", fn);
      return next(new TypeError("fn is not a function"));
    }
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
