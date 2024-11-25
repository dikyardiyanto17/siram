const express = require("express")
const Login = require("../../../controllers/login")
const router = express.Router()

router.post("/", Login.post_login)

module.exports = router
