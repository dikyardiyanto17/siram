const express = require("express")
const { User } = require("../../controllers/Users")
const { Middlewares } = require("../../middlewares")
const { Auth } = require("../../controllers/Auth")
const router = express.Router()

router.post("/register", Middlewares.registerCookie, User.post)
router.post("/login", Auth.login)
router.use("/user", require("./user"))
router.use("/otp", require("./otp"))

module.exports = router
