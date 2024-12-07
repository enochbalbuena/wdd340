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
    const accountData = res.locals.accountData;
    const isAdminOrEmployee = ["Admin", "Employee"].includes(accountData.account_type);
    const isClient = accountData.account_type === "Client";

    const flashMessages = {
      success: req.flash("success"),
      error: req.flash("error"),
    };

    res.render("account/management", {
      title: "Account Management",
      nav,
      flashMessages,
      accountData,
      isAdminOrEmployee,
      isClient,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

// Build Update Account Information View
const buildUpdateAccountView = async (req, res, next) => {
  try {
    const nav = await getNav();
    const accountId = req.params.account_id;

    // Fetch the account data by ID
    const accountData = await accountModel.getAccountById(accountId);
    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account");
    }

    res.render("account/update", {
      title: "Update Account Information",
      nav,
      accountData,
      errors: null,
    });
  } catch (error) {
    console.error("Error building update account view:", error);
    next(error);
  }
};

// Update Account Information
const updateAccount = async (req, res, next) => {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    // Server-side validation
    if (!account_firstname || !account_lastname || !account_email) {
      req.flash("error", "All fields are required.");
      return res.redirect(`/account/update/${account_id}`);
    }

    const emailExists = await accountModel.getAccountByEmail(account_email);
    if (emailExists && emailExists.account_id !== parseInt(account_id)) {
      req.flash("error", "The email address is already in use.");
      return res.redirect(`/account/update/${account_id}`);
    }

    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    if (updateResult) {
      req.flash("success", "Account information updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("error", "Failed to update account information. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error("Error updating account information:", error);
    req.flash("error", "An unexpected error occurred. Please try again.");
    res.redirect(`/account/update/${req.body.account_id}`);
  }
};

// Change Password
const changePassword = async (req, res, next) => {
  try {
    const { account_id, account_password } = req.body;

    // Server-side validation for password
    if (!account_password || account_password.length < 12) {
      req.flash(
        "error",
        "Password must be at least 12 characters long and include an uppercase letter, a number, and a special character."
      );
      return res.redirect(`/account/update/${account_id}`);
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const passwordResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (passwordResult) {
      req.flash("success", "Password updated successfully.");
    } else {
      req.flash("error", "Failed to update password. Please try again.");
    }

    // Redirect to account management, ensuring flash messages are passed
    return res.redirect("/account");
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("error", "An unexpected error occurred. Please try again.");
    res.redirect(`/account/update/${req.body.account_id}`);
  }
};


// Logout process
async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("success", "You have been logged out.");
  res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  showMyAccountPage,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  changePassword,
  logout
};
