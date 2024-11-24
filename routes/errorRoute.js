const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")

// Intentional 500 error route
router.get("/trigger-error", errorController.triggerError)

module.exports = router
