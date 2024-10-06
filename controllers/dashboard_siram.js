const ParticipantSiram = require("./participant_siram")
const RoomSiram = require("./room_siram")

class DashboardRoom {
	static async index(req, res, next) {
		try {
			const meetings = await RoomSiram.todayMeeting()
			const users = await ParticipantSiram.findAll()
			res.render("dashboard_siram", { backButton: false, meetings, users })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = DashboardRoom
