const { decodeToken, encodeToken } = require("../../helper/jwt")

class Login {
	static async index(req, res, next) {
		try {
			const { token } = req.session

			if (token) {
				const { authority, participant_id } = decodeToken(token)
				await res.render("pages/home/index", { authority: authority, participant_id: participant_id, token: req.session.token })
				return
			}

			if (!token) {
				await res.render("pages/login/index")
				return
			}

			const decodedUser = await decodeToken(token)

			if (!decodedUser) {
				await res.render("pages/login/index")
				return
			}

			await res.render("pages/home/index", { authority: req.user.authority, participant_id: req.user.participant_id, token: req.session.token })
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
			// await req.session.destroy()
			// await res.status(200).json({ message: "Successfully log out", status: true })
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Login
