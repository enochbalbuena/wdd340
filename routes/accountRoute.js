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

// Logout route
router.get("/logout", accountController.logout);

// Route to display the Update Account Information view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Display Update Account Information view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Process Update Account Information
router.post(
  "/update",
  validate.updateAccountRules(),
  validate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process Change Password
router.post(
  "/change-password",
  validate.passwordRules(),
  validate.checkPasswordData,
  utilities.handleErrors(accountController.changePassword)
);

// Update Account Information View
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Process Update Account Information
router.post(
  "/update",
  validate.updateAccountRules(), // Validate input fields
  validate.checkUpdateData,      // Handle validation errors
  utilities.handleErrors(accountController.updateAccount) // Process update
);

// Change Password
router.post(
  "/change-password",
  validate.passwordRules(),      // Validate password strength
  validate.checkPasswordData,    // Handle validation errors
  utilities.handleErrors(accountController.changePassword) // Process password update
);


module.exports = router;
