const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const pool = require("../database/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || !data.length) {
      return res.status(404).render("error", {
        title: "404 - Not Found",
        message: "No vehicles found in this classification.",
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId;
  try {
    const data = await invModel.getInventoryByInvId(invId);
    if (!data) {
      return res.status(404).render("error", {
        title: "404 - Not Found",
        message: "Vehicle not found.",
      });
    }
    const detailView = utilities.buildDetailView(data); // No need for async if static processing
    const nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detailView,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      flashMessages: req.flash(),
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const flashMessages = req.flash();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      flashMessages,
      stickyData: req.body || {}, // Add stickyData for rendering
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;

    // Validate input
    if (!classification_name) {
      req.flash("error", "Classification name is required.");
      return res.redirect("/inv/add-classification");
    }

    // Insert into the database
    await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1)",
      [classification_name]
    );

    req.flash("success", `The classification '${classification_name}' was successfully added.`);
    res.redirect("/inv/management");
  } catch (err) {
    console.error("Database Error Details:", err); // Log the error details
    if (err.code === "23505") {
      req.flash("error", "This classification already exists.");
    } else {
      req.flash("error", "There was an error adding the classification. Please try again.");
    }
    res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Build add-vehicle view
 * ************************** */
invCont.buildAddVehicleView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(); // Use the new function
    res.render("./inventory/add-vehicle", {
      title: "Add Vehicle",
      nav,
      classificationList,
      flashMessages: req.flash(),
      stickyData: req.body || {},
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process add-vehicle
 * ************************** */
invCont.processAddVehicle = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  if (
    !classification_id ||
    !inv_make ||
    !inv_model ||
    !inv_year ||
    !inv_description ||
    !inv_price ||
    !inv_miles ||
    !inv_color
  ) {
    req.flash("error", "All fields are required.");
    return res.render("./inventory/add-vehicle", {
      title: "Add Vehicle",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(),
      stickyData: req.body, // Pass back the data to repopulate the form
      flashMessages: req.flash(),
    });
  }

  try {
    await invModel.addVehicle(req.body); // Pass full vehicle object to model
    req.flash("success", "Vehicle added successfully.");
    res.redirect("/inv");
  } catch (error) {
    req.flash("error", "Failed to add the vehicle. Please try again.");
    res.render("./inventory/add-vehicle", {
      title: "Add Vehicle",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(),
      stickyData: req.body, // Pass back the data to repopulate the form
      flashMessages: req.flash(),
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    if (isNaN(classification_id)) {
      return res.status(400).json({ error: "Invalid classification ID" });
    }
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData.length > 0) {
      return res.json(invData);
    } else {
      return res.status(404).json({ error: "No inventory found for this classification" });
    }
  } catch (error) {
    console.error("Error fetching inventory:", error);
    next(error);
  }
};

invCont.editInventoryView = async function (req, res, next) {
  try {
      const inv_id = parseInt(req.params.inv_id);
      const nav = await utilities.getNav();
      const itemData = await invModel.getInventoryByInvId(inv_id);

      if (!itemData) {
          req.flash("error", "Inventory item not found.");
          return res.redirect("/inv/management");
      }

      const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

      res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList: classificationSelect,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
    });
  } catch (error) {
      next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    } = req.body;

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      "/images/vehicles/no-image.png", // Placeholder for image
      "/images/vehicles/no-image.png", // Placeholder for thumbnail
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      req.flash("success", "Vehicle updated successfully!");
      res.redirect("/inv/management"); // Redirect to management page
    } else {
      req.flash("error", "Vehicle update failed. Please try again.");
      res.redirect(`/inv/edit/${inv_id}`); // Redirect back to the edit form
    }
  } catch (error) {
    console.error("Error updating inventory:", error);
    req.flash("error", "An unexpected error occurred. Please try again.");
    res.redirect(`/inv/edit/${req.body.inv_id}`);
  }
};

module.exports = {
  buildManagementView: invCont.buildManagementView,
  editInventoryView: invCont.editInventoryView,
  getInventoryJSON: invCont.getInventoryJSON,
  updateInventory: invCont.updateInventory,
};