const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkLoginState = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {

        res.locals.loggedin = false;
        res.locals.accountData = null;
      } else {

        res.locals.loggedin = true;
        res.locals.accountData = accountData;
      }
      next();
    });
  } else {
    res.locals.loggedin = false;
    res.locals.accountData = null;
    next();
  }
};

module.exports = checkLoginState;
