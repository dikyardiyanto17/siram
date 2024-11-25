const express = require("express")
const Rooms = require("../../../controllers/room")
const router = express.Router()

router.get("/room", Rooms.get_room_id)

module.exports = router
