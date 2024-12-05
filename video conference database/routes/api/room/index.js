const express = require("express")
const Rooms = require("../../../controllers/room")
const router = express.Router()

router.get("/", Rooms.filterMeeting)
router.post("/", Rooms.create)

module.exports = router
