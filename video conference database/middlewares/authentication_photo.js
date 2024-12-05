const { decodeToken } = require("../helper/jwt")

const authenthication_photo = async (req, res, next) => {
	try {
		const { token } = req.query
		if (!token) {
			throw { name: "Invalid token", message: "Token not found" }
		}

		const { user } = await decodeToken(token)

		if (!user) {
			throw { name: "Invalid token", message: "Invalid user" }
		}

		req.user = { ...user }
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authenthication_photo
