const RoomSiram = require("./room_siram")

class DashboardRoom {
	static async index(req, res, next) {
		try {
			const meetings = await RoomSiram.todayMeeting()
			res.render("dashboard_siram", { backButton: false, meetings })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = DashboardRoom
