const express = require("express")
const googleAuth = require("../../middlewares/googleAuth")
const router = express.Router()

router.use("/google", require("./google_api"))
router.use("/meeting", googleAuth, require("./meetings"))

module.exports = router
