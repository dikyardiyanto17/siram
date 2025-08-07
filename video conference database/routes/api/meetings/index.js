const express = require("express")
const Meeting = require("../../../controllers/Meetings")
const router = express.Router()

router.post("/", Meeting.post)
router.get("/", Meeting.get)

module.exports = router
