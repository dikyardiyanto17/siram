const express = require("express")
const { OTP } = require("../../../controllers/OTP")
const { Middlewares } = require("../../../middlewares")
const router = express.Router()

router.post("/", Middlewares.otpCookie, OTP.post)
router.get("/resend", Middlewares.otpCookie, OTP.resendOtp)
router.get("/detail", Middlewares.otpCookie, OTP.detail)

module.exports = router
