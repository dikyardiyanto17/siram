const { decodeToken } = require("../helper/jwt")

const authorization
 = async (req, res, next) => {
	try {
		const { token } = req.session

		if (!token) throw { name: "Invalid_User", message: "User tidak valid" }

		const payload = decodeToken(token)

		if (!payload) {
			await res.redirect("login")
			return
		}

		// const user = await Participants.findUser({ participant_id: payload.participant_id, full_name: payload.full_name })

		// if (!user) throw { name: "Invalid_User", message: "User tidak valid" }

		// if (user.authority == 1 || user.authority == 2){
		// 	req.user = { participant_id: user.participant_id, authority: user.authority, full_name: user.full_name, picture: user.photo_path }
		// 	next()
		// } else {
		// 	await res.redirect("/")
		// }
	} catch (error) {
		next(error)
	}
}

module.exports = authorization

