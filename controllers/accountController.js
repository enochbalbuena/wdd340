const utilities = require("../utilities/index");
const accountModel = require("../models/account-model"); // Import the account model

// ****************************************
// *  Deliver login view
// ****************************************
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav(); // Fetch navigation
        res.render("account/register", {
            title: "Register",
            nav,
            errors: null, // No errors on initial render
            account_firstname: "", // Default empty value
            account_lastname: "", // Default empty value
            account_email: "" // Default empty value
        });
    } catch (error) {
        console.error("Error in buildRegister:", error.message);
        next(error); // Pass the error to the global error handler
    }
}


// ****************************************
// *  Deliver My Account page
// ****************************************
async function showMyAccountPage(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/myaccount", {
      title: "My Account",
      nav,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
    try {
      console.log("Form Data Received:", req.body); // Log form data
  
      let nav = await utilities.getNav(); // Get navigation
  
      const { account_firstname, account_lastname, account_email, account_password } = req.body;
      const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
      );
  
      if (regResult.rowCount > 0) {
        req.flash("success", `Registration successful! Welcome, ${account_firstname}. Please log in.`);
        res.status(201).render("account/login", {
          title: "Login",
          nav,
          messages: req.flash(), // Pass flash messages to the view
        });
      } else {
        req.flash("error", "Registration failed. Please try again.");
        res.status(500).render("account/register", {
          title: "Register",
          nav,
          messages: req.flash(), // Pass flash messages to the view
        });
      }
    } catch (error) {
      console.error("Error in registerAccount Controller:", error.message); // Log error message
      next(error); // Pass the error to the global error handler
    }
  }
  
  module.exports = {
    buildLogin,
    buildRegister,
    showMyAccountPage,
    registerAccount,
  };