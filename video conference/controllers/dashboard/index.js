const Participants = require("../participants")
const Rooms = require("../room")

class Dashboard {
	static async index(req, res, next) {
		try {
			const meetings = await Rooms.todayMeeting()
			const users = await Participants.findAll()
			res.render("pages/dashboard/index", { backButton: false, meetings, users })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Dashboard
