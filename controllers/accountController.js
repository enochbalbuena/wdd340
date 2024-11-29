const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");  // Add bcryptjs for password hashing

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
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: req.body.account_firstname || '',
    account_lastname: req.body.account_lastname || '',
    account_email: req.body.account_email || '' 
  });
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
    
    // Hash the password before storing
    let hashedPassword;
    try {
      // Hash password with a salt of cost factor 10
      hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.');
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  
    // Now, use hashedPassword instead of plain account_password for storing in the database
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
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
