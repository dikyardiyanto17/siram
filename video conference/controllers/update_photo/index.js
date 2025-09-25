const { Helpers } = require("../../helper")

class Update_Photo {
	static async index(req, res, next) {
		try {
			const { token } = req.session
			res.render("pages/update_photo/index", { token })
		} catch (error) {
			next(error)
		}
	}

	static async update_token(req, res, next) {
		try {
			const { nt } = req.query
			if (!nt) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: "Invalid new token" }
			}

			const { user } = await Helpers.decodeToken(nt)
			req.session.token = nt
			if (req.session.meeting) {
				req.session.meeting.photoPath = user.photo_path
			}
			res.status(200).json({ message: "Sukses update token", status: true })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Update_Photo
