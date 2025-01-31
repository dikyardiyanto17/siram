const express = require("express")
const CustomApi = require("../../controllers/custom_api")
const router = express.Router()

router.post("/login", CustomApi.customApiLogin)
router.get("/room", CustomApi.get_room_id)

module.exports = router
