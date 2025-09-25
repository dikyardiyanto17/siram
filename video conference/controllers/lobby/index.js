const { Helpers } = require("../../helper")

class Lobby {
	static async index(req, res, next) {
		try {
			console.log(req.cookies)
			res.render("pages/lobby/index")
		} catch (error) {
			next(error)
		}
	}

	static async sandbox(req, res, next) {
		try {
			const { meeting, roomToken } = req.session
			if (!meeting || !roomToken) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: "Room is not found" }
			}
			const { startDate, photoPath, roomName, roomId, password } = meeting
			res.render("pages/sandbox/index", {
				photo_path: photoPath,
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Lobby
