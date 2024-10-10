const express = require("express")
const router = express.Router()
const Messages = require("../../../controllers/messages/index.js")

router.post("/", Messages.create)
router.get("/", Messages.findMessage)

module.exports = router
