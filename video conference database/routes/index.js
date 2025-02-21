const express = require("express")
const authenthication = require("../middlewares/authentication.js")
const router = express.Router()
const path = require("path")
const Login = require("../controllers/login/index.js")
const Dashboard = require("../controllers/dashboard/index.js")
const Participants = require("../controllers/participants/index.js")
const Rooms = require("../controllers/room/index.js")
const authenthication_user = require("../middlewares/authenthication_user.js")
const authenthication_photo = require("../middlewares/authentication_photo.js")
const OllamaService = require("../controllers/llama/index.js")

router.get("/login", Login.index)
router.use("/api/login", require("./api/login"))
router.post("/ollama", OllamaService.post)

router.use("/api/video_conference", authenthication_user, require("./api/video_conference"))
// router.use("/photo", authenthication_photo, express.static(path.join(__dirname, "../photo")))
router.use("/photo", express.static(path.join(__dirname, "../photo")))

router.use(authenthication)

router.get("/meeting", Rooms.index)
router.get("/meeting/:room_id", Rooms.detail)
router.get("/", Dashboard.index)
router.get("/participant", Participants.index)
router.use("/api/room", require("./api/room"))
router.use("/api/participant", require("./api/participant"))

module.exports = router
