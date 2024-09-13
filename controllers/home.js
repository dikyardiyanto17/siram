const { todayMeeting } = require("./room_siram")

class ControllerHome {
	static async index(req, res) {
		try {
			const meetings = await todayMeeting()
			await res.render("home", { meetings })
		} catch (error) {
			console.log(error)
		}
	}
}
module.exports = ControllerHome
