const utilities = require("."); // Import index.js from the utilities folder
const { body, validationResult } = require("express-validator"); // Import express-validator tools
const accountModel = require("../models/account-model"); // Import account model
const validate = {}; // Create a validate object

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
      // First name is required and must be a string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),
  
      // Last name is required and must be a string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."),
  
      // A valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // Sanitize email
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          // Custom validation to check if the email exists in the database
          const emailExists = await accountModel.checkExistingEmail(account_email);
          if (emailExists) {
            throw new Error("Email exists. Please log in or use a different email");
          }
        }),

      // Password is required and must be strong
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation
    res.status(400).render("account/register", {
      errors: errors.array(), // Extract errors as an array
      title: "Register",
      nav,
      account_firstname: req.body.account_firstname || '', // Preserve first name
      account_lastname: req.body.account_lastname || '',   // Preserve last name
      account_email: req.body.account_email || '',         // Preserve email
      messages: req.flash(), // Add flash messages
    });
    return; // Stop further processing
  }
  next(); // If no errors, proceed to the next middleware/controller
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // A valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // Sanitize email
      .withMessage("A valid email is required."),

    // Password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation
    res.status(400).render("account/login", {
      errors: errors.array(), // Pass errors array to the view
      title: "Login",
      nav,
      account_email: req.body.account_email || '', // Preserve email
    });
    return; // Stop further processing
  }
  next(); // If no errors, proceed to the next middleware/controller
};

/* **********************************
 *  Update Account Data Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    // First name is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    
    // Last name is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    
    // A valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // Sanitize email
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Custom validation to check if the email exists in the database
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists && emailExists.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email is already in use. Please use a different email.");
        }
      }),
  ];
};

/* **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    // Password is required and must meet strength requirements
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters long and include an uppercase letter, a number, and a special character."
      ),
  ];
};

/* ******************************
 * Check update account data and return errors or continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation
    res.status(400).render("account/update", {
      errors: errors.array(), // Extract errors as an array
      title: "Update Account Information",
      nav,
      accountData: {
        account_id: req.body.account_id,
        account_firstname: req.body.account_firstname || '', // Preserve first name
        account_lastname: req.body.account_lastname || '',   // Preserve last name
        account_email: req.body.account_email || '',         // Preserve email
      },
      flashMessages: req.flash(), // Add flash messages
    });
    return; // Stop further processing
  }
  next(); // If no errors, proceed to the next middleware/controller
};

/* ******************************
 * Check password data and return errors or continue
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation
    res.status(400).render("account/update", {
      errors: errors.array(), // Extract errors as an array
      title: "Update Account Information",
      nav,
      accountData: {
        account_id: req.body.account_id,
        account_firstname: req.body.account_firstname || '', // Preserve first name
        account_lastname: req.body.account_lastname || '',   // Preserve last name
        account_email: req.body.account_email || '',         // Preserve email
      },
      flashMessages: req.flash(), // Add flash messages
    });
    return; // Stop further processing
  }
  next(); // If no errors, proceed to the next middleware/controller
};

module.exports = validate;
