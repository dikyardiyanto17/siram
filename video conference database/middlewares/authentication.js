const { decodeToken } = require("../helper/jwt")

const authenthication = async (req, res, next) => {
	try {
		const { token } = req.session

		const path = req.path

		if (path == "/" && !token) {
			await res.redirect("login")
			return
		}

		if (!token) {
			throw { name: "Invalid token", message: "Invalid user" }
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

module.exports = authenthication
