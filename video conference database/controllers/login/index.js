const { decodeToken, encodeToken } = require("../../helper/jwt")
const { Participant } = require("../../models")
const Participants = require("../participants")

class Login {
	static async index(req, res, next) {
		try {
			if (req.session.token) {
				const user = await decodeToken(req.session.token)
				if (user) {
					// const meetings = await Rooms.todayMeeting()
					// const users = await Participants.findAll()
					// await res.render("pages/dashboard/index", { backButton: false, meetings, users })
					res.render("pages/dashboard/index")
					return
				}
			}
			await res.render("pages/login/index")
		} catch (error) {
			next(error)
		}
	}

	static async post_login(req, res, next) {
		try {
			const { full_name, participant_id } = req.body
			if (!full_name || full_name.trim() == "" || !participant_id || participant_id.trim() == "") {
				throw { name: "Invalid_User", message: "Invalid User" }
			}
			const user = await Participant.findOne({
				where: {
					participant_id,
					full_name,
				},
				attributes: ["participant_id", "full_name", "user_id", "role", "exception", "status", "photo", "photo_path", "nik", "nrp", "authority"],
			})
			if (!user) {
				throw { name: "Invalid_User", message: "Invalid User" }
			}
			const token = encodeToken({ user })
			req.session.token = token
			console.log("- In Post Login : ", req.session)
			await res.status(200).json({ status: true, message: "User is valid", token })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Login
