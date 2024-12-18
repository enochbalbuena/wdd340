const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const pool = require("../database/");
const invCont = {};
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, and .png files are allowed.'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});


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
      stickyData: req.body || {},
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

    req.flash(
      "success",
      `The classification '${classification_name}' was successfully added.`
    );
    res.redirect("/inv/management");
  } catch (err) {
    console.error("Database Error Details:", err);
    if (err.code === "23505") {
      req.flash("error", "This classification already exists.");
    } else {
      req.flash(
        "error",
        "There was an error adding the classification. Please try again."
      );
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
    const classificationList = await utilities.buildClassificationList();
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

  console.log("req.body:", req.body); // Debug log
  console.log("req.file:", req.file); // Debug log

  // Ensure all required fields are provided
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
      stickyData: req.body,
      flashMessages: req.flash(),
    });
  }

  try {
    // Determine the image path
    let imagePath = "/images/vehicles/no-image.png"; // Default image
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`; // Use uploaded file
    }

    // Add the vehicle and get its ID
    const vehicleId = await invModel.addVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image: imagePath,
      inv_thumbnail: imagePath, // Thumbnail can match the main image
    });

    req.flash("success", "Vehicle added successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding vehicle:", error.message);
    req.flash("error", "Failed to add the vehicle. Please try again.");
    res.render("./inventory/add-vehicle", {
      title: "Add Vehicle",
      nav: await utilities.getNav(),
      classificationList: await utilities.buildClassificationList(),
      stickyData: req.body,
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

/* ***************************
 *  Edit Inventory View
 * ************************** */
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
      inv_image: itemData.inv_image || "/images/vehicles/no-image.png", // Pass the image URL
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
const fs = require("fs"); // Import file system module for file deletion

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
      delete_image, // Checkbox for deleting the existing image
    } = req.body;

    // Fetch the current data for the vehicle
    const currentData = await invModel.getInventoryByInvId(inv_id);
    let newImagePath = currentData.inv_image; // Default to the current image

    // Handle deletion of the current image if the checkbox is selected
    if (delete_image === "on") {
      const filePath = `public${currentData.inv_image}`; // Path to the current image on the server
      if (fs.existsSync(filePath) && currentData.inv_image !== "/images/vehicles/no-image.png") {
        fs.unlinkSync(filePath); // Delete the current image file
      }
      // Set the image path to the default placeholder
      newImagePath = "/images/vehicles/no-image.png";
    }

    // Handle uploading a new image
    if (req.file) {
      // Save the new image path
      newImagePath = `/uploads/${req.file.filename}`;

      // Automatically delete the previously referenced image if it's not the default placeholder
      if (currentData.inv_image && currentData.inv_image !== "/images/vehicles/no-image.png") {
        const oldImagePath = `public${currentData.inv_image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete the old image
        }
      }
    }

    // Update the inventory item in the database
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      newImagePath, // Use the updated image path
      newImagePath, // Thumbnail (optional, can match the image path)
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      req.flash("success", "Vehicle updated successfully!");
      res.redirect("/inv/management"); // Redirect to the management page
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


/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id); // Collect inv_id from request
    const nav = await utilities.getNav(); // Build navigation
    const itemData = await invModel.getInventoryByInvId(inv_id); // Fetch data for inventory item

    if (!itemData) {
      req.flash("error", "Inventory item not found.");
      return res.redirect("/inv/management");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`; // Build item name
    res.render("./inventory/delete-confirm", {
      title: `Delete ${itemName}`, // Title for the view
      nav,
      inv_id: itemData.inv_id, // Pass necessary data to the view
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process delete inventory item
 * ************************** */
invCont.processDeleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id, 10);
    if (isNaN(inv_id)) {
      req.flash("error", "Invalid inventory ID.");
      return res.redirect("/inv/management");
    }

    const deleteResult = await invModel.deleteInventory(inv_id);
    if (deleteResult > 0) {
      req.flash("success", "Vehicle deleted successfully!");
      return res.redirect("/inv/management");
    } else {
      req.flash("error", "Failed to delete the vehicle. It may not exist.");
      return res.redirect("/inv/management");
    }
  } catch (error) {
    console.error("Error deleting inventory:", error);
    req.flash("error", "An unexpected error occurred. Please try again.");
    return res.redirect("/inv/management");
  }
};

module.exports = invCont;