const { decodeToken, encodeToken } = require("../../helper/jwt")
const Participants = require("../participants")

class Verify {
	static async index(req, res, next) {
		try {
			// const { user } = req.query

			// if (!user) {
			// 	res.render("pages/verify_user/index", { status: false, message: "Invalid User" })
			// 	return
			// }

			// const decodedUser = await decodeToken(user)
			// if (!decodedUser) {
			// 	res.render("pages/verify_user/index", { status: false, message: "Invalid User" })
			// 	return
			// }
			// req.session.token = user
			// res.render("pages/verify_user/index", { status: true, message: "Verified User", token: user })
		} catch (error) {
			next(error)
		}
	}

	static async encodeToken(req, res, next) {
		try {
			// const { participant_id, full_name } = req.body
			// const user = await Participants.findUser({ participant_id, full_name })
			// if (!user) {
			// 	throw { name: "Invalid", message: "Invalid User" }
			// }
			// const encodedToken = await encodeToken({ participant_id: user.participant_id, full_name: user.full_name })
			// await res.status(200).json({ token: encodedToken })
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Verify
