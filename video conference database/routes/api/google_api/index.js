const express = require("express")
const router = express.Router()
const GoogleApi = require("../../../controllers/google_api")

router.get("/create_token", GoogleApi.createToken)
router.get("/auth", GoogleApi.googleCallback)
router.get("/access_token", GoogleApi.getGoogleAccessToken)

module.exports = router
