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

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory 
      SET 
        inv_make = $1, 
        inv_model = $2, 
        inv_description = $3, 
        inv_image = $4, 
        inv_thumbnail = $5, 
        inv_price = $6, 
        inv_year = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10 
      WHERE inv_id = $11 
      RETURNING *`;
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image || "/images/vehicles/no-image.png",
      inv_thumbnail || "/images/vehicles/no-image.png",
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    return result.rowCount; // Ensure it returns the number of deleted rows
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error; // Throw the error to propagate it
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
  addClassification,
  addVehicle,
  updateInventory,
  deleteInventory,
};
