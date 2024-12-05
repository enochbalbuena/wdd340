const jwt = require("jsonwebtoken");
require("dotenv").config();
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

let cachedNav = null;
async function getNav() {
  if (!cachedNav) {
    cachedNav = await utilities.getNav();
  }
  return cachedNav;
}

// Deliver login view
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      messages: req.flash(), // Add flash messages
    });
  } catch (error) {
    next(error);
  }
}

// Deliver registration view
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav(); // Get navigation data
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname: req.body.account_firstname || '', // Preserve first name
      account_lastname: req.body.account_lastname || '',   // Preserve last name
      account_email: req.body.account_email || '',         // Preserve email
      messages: req.flash(), // Add flash messages
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
}


// Deliver My Account page
async function showMyAccountPage(req, res, next) {
  try {
    let nav = await getNav();
    res.render("account/myaccount", {
      title: "My Account",
      nav,
    });
  } catch (error) {
    next(error);
  }
}

// Process Registration
async function registerAccount(req, res, next) {
  try {
    let nav = await getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    let hashedPassword = await bcrypt.hash(account_password, 10);

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
        messages: req.flash(),
      });
    } else {
      req.flash("error", "Registration failed. Please try again.");
      res.status(500).render("account/register", {
        title: "Register",
        nav,
        messages: req.flash(),
      });
    }
  } catch (error) {
    console.error("Database error during registration:", error.message);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    res.status(500).render("account/register", {
      title: "Register",
      nav: await getNav(),
      messages: req.flash(),
    });
  }
}

// Process login request
async function accountLogin(req, res) {
  try {
    let nav = await getNav();
    const { account_email, account_password } = req.body;

    // Validate fields
    if (!account_email || !account_password) {
      req.flash("notice", "Email and password are required.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
      });
    }

    // Fetch account data
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(account_password, accountData.account_password);
    if (!isPasswordValid) {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
      });
    }

    // Generate JWT
    delete accountData.account_password; // Do not include password in token
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600 * 1000,
    });

    // Redirect to account management
    req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
    res.redirect("/account/");
  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    let nav = await getNav();
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash(),
    });
  }
}

// Build Account Management View
const buildAccountManagement = async (req, res, next) => {
  try {
    const nav = await getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      flashMessages: res.locals.flashMessages || {},
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  buildLogin,
  buildRegister,
  showMyAccountPage,
  registerAccount,
  accountLogin,
  buildAccountManagement,
};
