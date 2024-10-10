const express = require("express")
const Participants = require("../../../controllers/participants")
const router = express.Router()

router.post("/", Participants.create)

module.exports = router
