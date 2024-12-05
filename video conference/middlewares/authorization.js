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
	} catch (error) {
		next(error)
	}
}

module.exports = authorization

