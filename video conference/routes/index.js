const express = require("express")
const Home = require("../controllers/home/index.js.js")
const Meeting = require("../controllers/meeting/index.js")
const Dashboard = require("../controllers/dashboard/index.js")
const Participants = require("../controllers/participants/index.js")
const Rooms = require("../controllers/room/index.js")
const Verify = require("../controllers/verify/index.js")
const authenthication = require("../middlewares/authentication.js")
const Login = require("../controllers/login/index.js")
const Lobby = require("../controllers/lobby/index.js")
const Update_Photo = require("../controllers/update_photo/index.js")
const router = express.Router()
const path = require("path")
const authorization = require("../middlewares/authorization.js")

router.get("/login", Login.index)
router.use("/api/login", require("./api/login/index.js"))

router.use(authenthication)

router.get("/", Home.index)
// // router.get("/api/meetings", Rooms.findMeetingsWithParticipants)
// router.get("/verify", Verify.index)
// router.use("/api/token", require("./api/token/token.js"))
// router.get("/logout", Login.logout)


router.get("/room/:room", Meeting.index)
router.use("/photo", express.static(path.join(__dirname, "../photo")))
// router.use("/api/message", require("./api/message/message.js"))
router.get("/updatephoto", Update_Photo.index)
router.get("/updatetoken", Update_Photo.update_token)
// router.use("/api/photo", require("./api/photo/photo.js"))

// router.use(authorization)

// router.use("/api/room", require("./api/room/room.js"))
// router.use("/api/participant", require("./api/participant/participant.js"))

// router.get("/meeting", Rooms.index)
router.get("/lobby", Lobby.index)
// router.get("/meeting/:room_id", Rooms.detail)
// router.get("/dashboard", Dashboard.index)
// router.get("/participant", Participants.index)

module.exports = router
