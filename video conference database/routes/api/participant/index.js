const express = require("express")
const Participants = require("../../../controllers/participants")
const router = express.Router()

router.get("/", Participants.getAll)

module.exports = router
