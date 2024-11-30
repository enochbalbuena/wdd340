const utilities = require("../utilities/")
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav(); // Fetch navigation
  res.render("index", {
    title: "Home",
    nav, // Pass navigation to the view
    flashMessages: req.flash() // Pass flash messages to the view
  });
};

module.exports = baseController;
