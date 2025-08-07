const express = require("express")
const GoogleApi = require("../../../controllers/google")
const router = express.Router()

router.post("/", GoogleApi.post)
router.get("/", GoogleApi.get)

module.exports = router
