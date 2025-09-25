const express = require("express")
const { File } = require("../../../controllers/Files")
const { Middlewares } = require("../../../middlewares")
const router = express.Router()
const path = require("path")

router.post("/", Middlewares.cookieAuth, Middlewares.authentication, File.post)
router.use(
	"/files",
	Middlewares.cookieAuth,
	Middlewares.authentication,
	Middlewares.roomAuthorization,
	express.static(path.join(__dirname, "../../../uploads"))
)

module.exports = router