const express = require("express")
const router = express.Router()
const Messages = require("../../../controllers/message.js")

router.post("/", Messages.create)
router.get("/", Messages.findMessage)

module.exports = router
