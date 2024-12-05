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

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount > 0; // Return true if email exists, false otherwise
    } catch (error) {
      console.error("Error checking email:", error.message);
      return false;
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail
};
