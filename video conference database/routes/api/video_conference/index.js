const express = require("express")
const Rooms = require("../../../controllers/room")
const Messages = require("../../../controllers/messages")
const Update_Photo = require("../../../controllers/update_photo")
const router = express.Router()

router.get("/room", Rooms.get_room_id)
router.get("/message/:room_id", Messages.findMessage)
router.post("/message", Messages.create)
router.put("/photo", Update_Photo.put)

module.exports = router
