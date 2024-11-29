const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const validate = require("../utilities/account-validation");

// Route for "My Account" page
router.get("/myaccount", accountController.showMyAccountPage, utilities.errorHandler);

// Route for Login page
router.get("/login", accountController.buildLogin, utilities.errorHandler);

// Route for Registration page (GET - Display the form)
router.get("/register", accountController.buildRegister, utilities.errorHandler);

console.log("Validate Object:", validate);
console.log("Utilities Object:", utilities);
console.log("Account Controller Object:", accountController);

// Add validation middleware and process registration data (POST)
router.post(
    "/register",
    validate.registrationRules(), // Apply validation rules
    validate.checkRegData,        // Check for validation errors
    utilities.handleErrors(accountController.registerAccount) // Process registration
  );

module.exports = router;
