const ParticipantSiram = require("../controllers/participant_siram")
const { decodeToken } = require("../helper/jwt")

const authenthication = async (req, res, next) => {
	const { token } = req.session
	try {
		console.log(token)
		if (!token) throw { name: "Invalid", message: "User tidak valid" }
		const payload = decodeToken(token)
		const user = await ParticipantSiram.findUser({ participant_id: payload.participant_id, full_name: payload.full_name })
		if (!user) throw { name: "Invalid", message: "User tidak valid" }
		req.user = { id: user.id }
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authenthication
