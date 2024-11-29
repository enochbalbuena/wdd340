// Require the database connection
const pool = require("../database/index");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
      const sql = `
        INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
        VALUES ($1, $2, $3, $4, 'Client') RETURNING *;
      `;
      const result = await pool.query(sql, [
        account_firstname,
        account_lastname,
        account_email,
        account_password,
      ]);
      console.log("Inserted Row:", result.rows[0]); // Log the inserted row
      return result;
    } catch (error) {
      console.error("Database Error in registerAccount:", error.message); // Log full error message
      throw error; // Re-throw the error for higher-level handling
    }
  }

module.exports = {
  registerAccount,
};
