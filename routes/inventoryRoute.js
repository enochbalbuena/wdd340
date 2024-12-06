const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const Util = require("../utilities");
const validate = require("../utilities/validation");

// Redirect /inv to /inv/management
router.get("/", (req, res) => {
  res.redirect("/inv/management");
});

// Route to build inventory by classification
router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId) // Wrap async function
);

// Route to build inventory item details
router.get(
  "/detail/:invId",
  Util.handleErrors(invController.buildByInvId) // Wrap async function
);

// Route for management view
router.get(
  "/management",
  Util.handleErrors(invController.buildManagementView) // Wrap async function
);

// Route for add-classification view
router.get(
  "/add-classification",
  Util.handleErrors(invController.buildAddClassificationView) // Wrap async function
);

// Route to process add-classification
router.post(
  "/add-classification",
  Util.handleErrors(invController.processAddClassification) // Wrap async function
);

// Route for add-vehicle view
router.get(
  "/add-vehicle",
  Util.handleErrors(invController.buildAddVehicleView) // Wrap async function
);

// Route to process add-vehicle
router.post(
  "/add-vehicle",
  Util.handleErrors(invController.processAddVehicle) // Wrap async function
);

// New route for getting inventory by classification ID as JSON
router.get(
  "/getInventory/:classification_id",
  Util.handleErrors(invController.getInventoryJSON)
);

// Route for editing inventory
router.get(
  "/edit/:inv_id",
  Util.handleErrors(invController.editInventoryView)
);

// Route to update inventory
router.post(
  "/update/",
  validate.vehicleRules(),
  validate.checkUpdateData,
  Util.handleErrors(invController.updateInventory)
);

module.exports = router;
