const utilities = require("."); // Import index.js from the utilities folder
const { body, validationResult } = require("express-validator"); // Import express-validator tools
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
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // Sanitize email
        .withMessage("A valid email is required."),
  
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
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req); // Get validation errors

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Fetch navigation
    res.status(400).render("account/register", {
      errors: errors.array(), // Pass errors array to the view
      title: "Register",
      nav,
      account_firstname, // Preserve entered data
      account_lastname, // Preserve entered data
      account_email, // Preserve entered data
    });
    return; // Stop further processing
  }
  next(); // If no errors, proceed to the next middleware/controller
};

module.exports = validate;
