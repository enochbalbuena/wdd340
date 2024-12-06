const { body, validationResult } = require("express-validator");

const validate = {};

/* **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("Classification name must only contain letters and cannot be empty."),
  ];
};

/* **********************************
 *  Vehicle Validation Rules
 * ********************************* */
validate.vehicleRules = () => {
  return [
    body("inv_make").trim().escape().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().escape().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .trim()
      .escape()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number."),
    body("inv_price").isNumeric().withMessage("Price must be a valid number."),
    body("inv_color").trim().escape().notEmpty().withMessage("Color is required."),
  ];
};

/* **********************************
 *  Check Validation Results for Adding Data
 * ********************************* */
validate.checkData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    res.status(400).render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name || "",
    });
    return;
  }
  next();
};

/* **********************************
 *  Check Validation Results for Updating Data
 * ********************************* */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await require("./index").getNav();
    res.status(400).render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit Vehicle",
      nav,
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_color: req.body.inv_color,
    });
    return;
  }
  next();
};

module.exports = validate;
