class Lobby {
	static async index(req, res, next) {
		try {
			const { meeting, roomToken } = req.session
			const { rid, pw } = req.query
			if (!meeting || !roomToken) {
				throw { name: "Invalid_Room", message: "Room is not found" }
			}

			const { startDate, photoPath, roomName, roomId, password } = meeting

			if (!startDate || !roomName || !roomId || !password) {
				throw { name: "Invalid_Room", message: "Room is not found" }
			}

			if (!photoPath) {
				res.redirect(`/updatephoto?rid=${roomId}&pw=${password}`)
				return
			}

			res.render("pages/lobby/index", {
				photo_path: photoPath,
				start_date: startDate,
				room_name: roomName,
				room_id: roomId,
				password,
				token: roomToken,
			})
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
