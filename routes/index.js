const express = require("express")
const ControllerHome = require("../controllers/home.js")
const ControllerRoom = require("../controllers/room.js")
const DashboardRoom = require("../controllers/dashboard_siram.js")
const ParticipantSiram = require("../controllers/participant_siram.js")
const RoomSiram = require("../controllers/room_siram.js")
const Verify = require("../controllers/verify.js")
const authenthication = require("../middlewares/authentication.js")
const router = express.Router()

router.get("/verify", Verify.index)
router.use("/api/token", require("./api/token/token.js"))

router.use(authenthication)

router.use("/api/room", require("./api/room/room.js"))
router.use("/api/participant", require("./api/participant/participant.js"))

router.get("/", ControllerHome.index)
router.get("/room", RoomSiram.index)
router.get("/room/:room", ControllerRoom.index)
router.get("/dashboard", DashboardRoom.index)
router.get("/participant", ParticipantSiram.index)

module.exports = router
