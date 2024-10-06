const express = require("express")
const ControllerHome = require("../controllers/home.js")
const ControllerRoom = require("../controllers/room.js")
const DashboardRoom = require("../controllers/dashboard_siram.js")
const ParticipantSiram = require("../controllers/participant_siram.js")
const RoomSiram = require("../controllers/room_siram.js")
const Verify = require("../controllers/verify.js")
const authenthication = require("../middlewares/authentication.js")
const Login = require("../controllers/login.js")
const Lobby = require("../controllers/lobby.js")
const Update_Photo = require("../controllers/update_photo.js")
const router = express.Router()
const path = require("path")

router.get("/login", Login.index)
// router.get("/api/meetings", RoomSiram.findMeetingsWithParticipants)
router.post("/api/login", Login.postLogin)
router.get("/verify", Verify.index)
router.use("/api/token", require("./api/token/token.js"))

router.use(authenthication)

router.use("/photo", express.static(path.join(__dirname, "../photo")));
router.use("/api/room", require("./api/room/room.js"))
router.use("/api/participant", require("./api/participant/participant.js"))
router.use("/api/photo", require("./api/photo/photo.js"))

router.get("/", ControllerHome.index)
router.get("/updatephoto", Update_Photo.index)
router.get("/meeting", RoomSiram.index)
// router.get("/lobby", Lobby.index)
router.get("/meeting/:room_id", RoomSiram.detail)
router.get("/room/:room", ControllerRoom.index)
router.get("/dashboard", DashboardRoom.index)
router.get("/participant", ParticipantSiram.index)

module.exports = router
