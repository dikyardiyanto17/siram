const express = require("express")
const ControllerHome = require("../controllers/home.js")
const ControllerRoom = require("../controllers/room.js")
const router = express.Router()

router.get("/", ControllerHome.home)
router.get("/room/:room", ControllerRoom.room)

module.exports = router
