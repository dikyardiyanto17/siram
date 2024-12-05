const { decodeToken } = require("../../helper/jwt")

class Meeting {
	static async index(req, res, next) {
		try {
			const { authority, participantId, roomId, meetingType, photoPath, password, faceRecognition } = req.session.meeting
			const { roomToken } = req.session
			res.render("pages/meeting/index", {
				authority,
				participant_id: participantId,
				roomId,
				meetingType,
				picture: photoPath ? photoPath : "P_0000000",
				password,
				faceRecognition,
				token: roomToken,
				user_token: req.session.token
			})
		} catch (error) {
			next(error)
		}
	}

	// -- Connecting with socket -- //
	static async joinRoom({ room_id, participant_id, password }) {
		try {
			// const optionsMeeting = {
			// 	where: {
			// 		room_id,
			// 		password,
			// 	},
			// }
			// const optionUser = {
			// 	where: {
			// 		participant_id,
			// 	},
			// }
			// const meeting = await Room.findOne(optionsMeeting)
			// const user = await Participant.findOne(optionUser)
			// if (!meeting || !user) {
			// 	return null
			// }
			// if (meeting.dataValues.meeting_type == 1) {
			// 	const participant = await Room_Participant.findOne({
			// 		where: {
			// 			participant_id,
			// 			room_id,
			// 		},
			// 	})
			// 	if (!participant) {
			// 		return null
			// 	}
			// 	return { room: meeting.dataValues, user: user.dataValues }
			// } else if (meeting.dataValues.meeting_type == 2) {
			// 	return { room: meeting.dataValues, user: user.dataValues }
			// } else {
			// 	return null
			// }
		} catch (error) {
			return null
		}
	}
}
module.exports = Meeting
