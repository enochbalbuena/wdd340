const errorCont = {}

/* ***************************
 *  Trigger an intentional error
 * ************************** */
errorCont.triggerError = function (req, res, next) {
  try {
    throw new Error("Intentional Server Error")
  } catch (error) {
    next(error)
  }
}

module.exports = errorCont
