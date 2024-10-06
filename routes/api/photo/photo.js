const express = require("express")
const Update_Photo = require("../../../controllers/update_photo")
const router = express.Router()

router.put("/", Update_Photo.put)

module.exports = router
