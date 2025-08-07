const express = require("express")
const router = express.Router()

router.use("/api", require("./api/index.js"))

module.exports = router
