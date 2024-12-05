const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");

// Default Route: Account Management View
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Show My Account Page
router.get("/myaccount", utilities.handleErrors(accountController.showMyAccountPage));

// Display Login Page
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process Login Request
router.post(
  "/login",
  validate.loginRules(),       // Apply login validation rules
  validate.checkLoginData,     // Check the login data
  utilities.handleErrors(accountController.accountLogin) // Controller to process login
);

// Display Registration Page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process Registration Request
router.post(
  "/register",
  validate.registrationRules(), // Apply registration validation rules
  validate.checkRegData,        // Check the registration data
  utilities.handleErrors(accountController.registerAccount) // Controller to process registration
);

module.exports = router;
