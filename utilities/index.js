const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    data.forEach((vehicle) => {
      grid += `
        <div class="vehicle-card">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
          <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p>Mileage: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
          <a href="/inv/detail/${vehicle.inv_id}" class="btn-view-details">View Details</a>
        </div>
      `;
    });
  } else {
    grid = "<p>No vehicles found for this classification.</p>";
  }
  return grid;
};


  /* ***************************
 *  Build the vehicle detail view HTML
 * ************************** */
  Util.buildDetailView = async function (data) {
    return {
      inv_image: data.inv_image, // Full-size image
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      inv_description: data.inv_description,
    };
  };

module.exports = Util