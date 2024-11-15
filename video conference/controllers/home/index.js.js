const { decodeToken } = require("../../helper/jwt")
const Participants = require("../participants")
const Room_Participants = require("../room_participant")
const { findRoom } = require("../room")

class Home {
	static async index(req, res, next) {
		try {
			const { pw, rid } = req.query
			const { participant_id, full_name } = req.user
			if (pw && rid) {
				const meeting = await findRoom({ room_id: rid, password: pw })
				if (meeting.meeting_type == 1) {
					const checkUser = await Room_Participants.checkUser({ participant_id, room_id: rid })
					if (!checkUser) {
						await res.render("pages/not_found/index")
						return
					}

					const user = await Participants.findUser({ participant_id, full_name })

					if (!user) {
						await res.render("pages/not_found/index")
						return
					}
					await res.render("pages/lobby/index", { ...user, room_id: rid, password: pw, ...meeting })
					return
				}
			}
			await res.render("pages/home/index", { authority: req.user.authority, participant_id })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
