const express = require("express")
const router = express.Router()

router.use("/google", require("./google_api"))
router.use("/meeting", require("./meetings"))
router.use("/chat", require("./chats"))
router.use("/file", require("./files"))

module.exports = router
