const express = require("express")
const Rooms = require("../../../controllers/room")
const router = express.Router()

router.post("/", Rooms.create)
router.get("/", Rooms.filterMeeting)

module.exports = router
