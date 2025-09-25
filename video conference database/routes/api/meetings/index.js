const express = require("express")
const Meeting = require("../../../controllers/Meetings")
const { Middlewares } = require("../../../middlewares")
const router = express.Router()

router.get("/", Middlewares.cookieAuth, Meeting.get)
router.get("/check-meeting", Meeting.check)
router.get("/:roomid", Middlewares.cookieAuth, Middlewares.authentication, Meeting.detail)
router.put("/", Middlewares.cookieAuth, Middlewares.authentication, Meeting.put)
router.post("/", Middlewares.cookieHandler, Meeting.post)
router.post("/schedule-meeting", Middlewares.googleAuth, Meeting.post_google_calender)

module.exports = router
