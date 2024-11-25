const express = require("express")
const Rooms = require("../../../controllers/room")
const router = express.Router()

router.get("", Rooms.get_room_id)

module.exports = router
