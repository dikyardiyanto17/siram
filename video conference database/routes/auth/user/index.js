const express = require("express")
const { User } = require("../../../controllers/Users")
const { Middlewares } = require("../../../middlewares")
const router = express.Router()

router.get("/detail", Middlewares.cookieAuth, User.detail)

module.exports = router
