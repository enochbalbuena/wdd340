const jwt = require("jsonwebtoken");

function checkAccountType(req, res, next) {
  const token = req.cookies.jwt; // Get the JWT token from cookies
  if (!token) {
    req.flash("error", "You must log in to access this resource.");
    return res.redirect("/account/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      console.error("JWT verification failed:", err);
      req.flash("error", "Invalid or expired session. Please log in again.");
      return res.redirect("/account/login");
    }
  
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      res.locals.accountData = accountData;
      return next();
    } else {
      req.flash("error", "You are not authorized to access this resource.");
      return res.redirect("/account/login");
    }
  });
}

module.exports = checkAccountType;
