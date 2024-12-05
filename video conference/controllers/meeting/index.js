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
}
module.exports = Meeting
