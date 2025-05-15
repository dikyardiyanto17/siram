const { baseUrl } = require("../../../config")
const { decodeToken, encodeToken } = require("../../helper/jwt")

class Login {
	static async index(req, res, next) {
		try {
			const { token } = req.session

			if (!token) {
				await res.render("pages/login/index")
				return
			}

			const decodedUser = await decodeToken(token)

			if (!decodedUser) {
				await res.render("pages/login/index")
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
				throw { name: "Invalid token", message: "Invalid user" }
			}

			const { user } = await decodeToken(token)

			if (!user) {
				throw { name: "Invalid token", message: "Invalid user" }
			}

			req.session.token = token

			await res.status(200).json({ status: true, authority: user.authority, message: "Successfully Login" })
		} catch (error) {
			next(error)
		}
	}

	static async logout(req, res, next) {
		try {
			await req.session.destroy()
			await res.status(200).json({ message: "Successfully log out", status: true })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Login
