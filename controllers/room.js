const { Room, Participant } = require("../models")
const { Op, where } = require("sequelize")
class ControllerRoom {
	static index(req, res) {
		try {
			const { roomId } = req.session
			const { participant_id, authority } = req.user
			res.render("room", { authority, participant_id, roomId })
		} catch (error) {
			console.log(error)
		}
	}

	// -- Connecting with socket -- //
	static async joinRoom({ room_id, participant_id }) {
		try {
			const optionsMeeting = {
				where: {
					room_id,
				},
			}

			const optionUser = {
				where: {
					participant_id,
				},
			}

			const meeting = await Room.findOne(optionsMeeting)
			const user = await Participant.findOne(optionUser)

			if (!meeting || !user) {
				return null
			}

			if (meeting.dataValues.meeting_type == 1) {
				console.log("- Tipe Rapat Perkara")
			} else if (meeting.dataValues.meeting_type == 2) {
				return { room: meeting.dataValues, user: user.dataValues }
			} else {
				return null
			}
		} catch (error) {
			console.log(error)
			return null
		}
	}
}
module.exports = ControllerRoom
