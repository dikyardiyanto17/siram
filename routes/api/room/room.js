const express = require("express")
const RoomSiram = require("../../../controllers/room_siram")
const router = express.Router()

router.post("/", RoomSiram.create)
router.get("/", RoomSiram.filterMeeting)

module.exports = router
