const { baseUrl } = require("../../config/index.js")
const { Helpers } = require("../../helper/index.js")

class Login {
	static async index(req, res, next) {
		try {
			const { token } = req.session

			if (!token) {
				await res.render("pages/login/index", { baseUrl })
				return
			}

			const decodedUser = await Helpers.decodeToken(token)

			if (!decodedUser) {
				await res.render("pages/login/index", { baseUrl })
				return
			}
			const { user } = decodedUser

			await res.render("pages/home/index", {
				authority: user.authority,
				participant_id: user.participant_id,
				token: token,
				picture: user.photo_path,
				baseUrl,
			})
		} catch (error) {
			next(error)
		}
	}

	static async postLogin(req, res, next) {
		try {
			const authHeader = req.headers["authorization"]
			const token = authHeader && authHeader.split(" ")[1]
			if (!token) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const { user } = await Helpers.decodeToken(token)

			if (!user) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			req.session.token = token

			await res.status(200).json({ status: true, authority: user.authority, message: "Successfully Login" })
		} catch (error) {
			next(error)
		}
	}

	static async logout(req, res, next) {
		try {
			res.clearCookie("userCookie")
			res.clearCookie("roomToken")

			return res.status(200).json({
				message: "Successfully logged out",
				status: true,
			})
		} catch (error) {
			return next(error)
		}
	}
}
module.exports = Login
