const { Room, Participant, Room_Participant } = require("../../models")
const { Op, where } = require("sequelize")
class Meeting {
	static index(req, res) {
		try {
			const { roomId, meetingType, password, faceRecognition } = req.session
			const { participant_id, authority, picture } = req.user
			if (!roomId || roomId.trim() == "") {
				res.redirect("/")
				return
			}

			res.render("pages/meeting/index", { authority, participant_id, roomId, meetingType, picture: picture ? picture:"P_0000000", password, faceRecognition })
		} catch (error) {
			console.log(error)
		}
	}

	// -- Connecting with socket -- //
	static async joinRoom({ room_id, participant_id, password }) {
		try {
			const optionsMeeting = {
				where: {
					room_id,
					password,
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
				const participant = await Room_Participant.findOne({
					where: {
						participant_id,
						room_id,
					},
				})
				if (!participant) {
					return null
				}
				return { room: meeting.dataValues, user: user.dataValues }
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
module.exports = Meeting
