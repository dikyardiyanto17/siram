const express = require("express")
const router = express.Router()

router.use("/login", require("./login/index.js"))
router.use("/google", require("./google/index.js"))


module.exports = router
