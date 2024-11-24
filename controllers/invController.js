const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data.length) {
      return res.status(404).render("error", {
        title: "404 - Not Found",
        message: "No vehicles found in this classification.",
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
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
    const detailView = await utilities.buildDetailView(data);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detailView,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
