const express = require("express")
const ParticipantSiram = require("../../../controllers/participant_siram")
const router = express.Router()

router.post("/", ParticipantSiram.create)

module.exports = router
