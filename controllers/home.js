const { decodeToken } = require("../helper/jwt")
const ParticipantSiram = require("./participant_siram")
const { RoomParticipantSiram } = require("./room_participant_siram")
const { findRoom } = require("./room_siram")

class ControllerHome {
	static async index(req, res, next) {
		try {
			const { pw, rid } = req.query
			if (pw && rid) {
				const meeting = await findRoom({ room_id: rid, password: pw })
				if (meeting.meeting_type == 1) {
					const { participant_id, full_name } = req.user
					const checkUser = await RoomParticipantSiram.checkUser({ participant_id, room_id: rid })
					if (!checkUser) {
						await res.render("not_found")
						return
					}

					const user = await ParticipantSiram.findUser({ participant_id, full_name })

					if (!user) {
						await res.render("not_found")
						return
					}
					await res.render("lobby", { ...user, room_id: rid, password: pw, ...meeting })
					return
				}
			}
			await res.render("home")
		} catch (error) {
			next(error)
		}
	}
}
module.exports = ControllerHome
