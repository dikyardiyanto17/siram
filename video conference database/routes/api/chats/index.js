const express = require("express")
const { Chat } = require("../../../controllers/Chats")
const { Middlewares } = require("../../../middlewares")
const router = express.Router()

router.post("/", Middlewares.cookieAuth, Middlewares.authentication, Middlewares.roomAuthorization, Chat.post)
router.get("/", Middlewares.cookieAuth, Middlewares.authentication, Middlewares.roomAuthorization, Chat.get)

module.exports = router
