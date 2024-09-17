const ParticipantSiram = require("../controllers/participant_siram")
const { decodeToken } = require("../helper/jwt")

const authenthication = async (req, res, next) => {
	const { token } = req.session
	try {
		if (!token) throw { name: "Invalid_User", message: "User tidak valid" }
		const payload = decodeToken(token)
		const user = await ParticipantSiram.findUser({ participant_id: payload.participant_id, full_name: payload.full_name })
		if (!user) throw { name: "Invalid_User", message: "User tidak valid" }
		req.user = { participant_id: user.participant_id, authority: user.authority }
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authenthication
