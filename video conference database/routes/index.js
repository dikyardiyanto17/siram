const express = require("express")
const router = express.Router()

router.use("/auth", require("./auth/index.js"))
router.use("/api", require("./api/index.js"))

module.exports = router
