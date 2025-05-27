class Lobby {
	static async index(req, res, next) {
		try {
			res.render("pages/lobby/index")
		} catch (error) {
			next(error)
		}
	}

	static async sandbox(req, res, next) {
		try {
			const { meeting, roomToken } = req.session
			if (!meeting || !roomToken) {
				throw { name: "Invalid_Room", message: "Room is not found" }
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
