const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result.rows; // Ensure it returns the rows
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw error; // Throw the error to propagate it
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error querying inventory by classification:", error);
    throw error;
  }
}

/* ***************************
 *  Get vehicle data by inventory ID
 * ************************** */
async function getInventoryByInvId(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [invId]
    );
    return data.rows[0];
  } catch (error) {
    console.error("Error querying inventory by inventory ID:", error);
    throw error;
  }
}

/* ***************************
 *  Add classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1)";
    await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("Error adding classification:", error);
    throw error;
  }
}

/* ***************************
 *  Add vehicle
 * ************************** */
async function addVehicle(vehicleData) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
  } = vehicleData;

  try {
    const sql = `
      INSERT INTO public.inventory 
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '/images/vehicles/no-image.png', '/images/vehicles/no-image.png')
    `;
    await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    ]);
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
  addClassification,
  addVehicle,
};
