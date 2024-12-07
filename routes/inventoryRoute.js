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
  Util.checkAccountType,
  Util.handleErrors(invController.buildManagementView)
);

// Route for add-classification view
router.get(
  "/add-classification",
  Util.checkAccountType,
  Util.handleErrors(invController.buildAddClassificationView)
);

// Route to process add-classification
router.post(
  "/add-classification",
  Util.checkAccountType,
  Util.handleErrors(invController.processAddClassification)
);

// Route for add-vehicle view
router.get(
  "/add-vehicle",
  Util.checkAccountType,
  Util.handleErrors(invController.buildAddVehicleView)
);

// Route to process add-vehicle
router.post(
  "/add-vehicle",
  Util.checkAccountType,
  Util.handleErrors(invController.processAddVehicle)
);

// New route for getting inventory by classification ID as JSON
router.get(
  "/getInventory/:classification_id",
  Util.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/edit/:inv_id",
  Util.checkAccountType,
  Util.handleErrors(invController.editInventoryView)
);

// Route to update inventory
router.post(
  "/update/",
  Util.checkAccountType,
  validate.vehicleRules(),
  validate.checkUpdateData,
  Util.handleErrors(invController.updateInventory)
);

// Route for delete confirmation view
router.get(
  "/delete/:inv_id",
  Util.checkAccountType,
  Util.handleErrors(invController.buildDeleteConfirmationView)
);

// Route to process delete inventory
router.post(
  "/delete/",
  Util.checkAccountType,
  Util.handleErrors(invController.processDeleteInventory)
);

module.exports = router;
