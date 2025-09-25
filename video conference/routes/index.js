const express = require("express")
const Home = require("../controllers/home/index.js")
const Meeting = require("../controllers/meeting/index.js")
const Login = require("../controllers/login/index.js")
const Lobby = require("../controllers/lobby/index.js")
const Update_Photo = require("../controllers/update_photo/index.js")
const router = express.Router()
const path = require("path")
const PrivacyPolicy = require("../controllers/privacy_policy/index.js")
const { Middlewares } = require("../middlewares/index.js")
const { OTP } = require("../controllers/otp/index.js")

router.use("/api", require("./api/index.js"))
router.use("/custom_api", require("./custom_api"))

router.get("/", Home.index)
router.get("/otpverification", OTP.index)
router.get("/privacy-policy", PrivacyPolicy.index)
router.get("/logout", Login.logout)
router.get("/lobby", Lobby.index)
router.use("/photo", express.static(path.join(__dirname, "../photo")))
router.use(Middlewares.authenthication)

router.get("/room/:room", Meeting.index)
// router.get("/updatetoken", Update_Photo.update_token)

module.exports = router
