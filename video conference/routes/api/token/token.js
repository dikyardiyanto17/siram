const express = require("express")
const Verify = require("../../../controllers/verify")
const router = express.Router()

router.post("/", Verify.encodeToken)

module.exports = router
