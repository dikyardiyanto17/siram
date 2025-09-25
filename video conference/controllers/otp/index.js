const { baseUrl } = require("../../config")
const { Helpers } = require("../../helper")
const axios = require("axios")

class OTP {
	static async index(req, res, next) {
		try {
			const { handsoff } = req.cookies
			let data = {
				email: "",
				username: "",
			}
			if (!handsoff) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUNDPAGE.name, message: Helpers.RESPONSEERROR.NOTFOUNDPAGE.message }
			}

			try {
				const response = await axios.get(`${res.locals.databaseUrl}/auth/otp/detail`, {
					headers: {
						Cookie: req.headers.cookie,
					},
				})

				if (!response?.data?.status) {
					throw { name: Helpers.RESPONSEERROR.NOTFOUNDPAGE.name, message: Helpers.RESPONSEERROR.NOTFOUNDPAGE.message }
				}

				const { accessToken } = response.data.data[0]

				if (!accessToken) {
					throw { name: Helpers.RESPONSEERROR.NOTFOUNDPAGE.name, message: Helpers.RESPONSEERROR.NOTFOUNDPAGE.message }
				}

				const decodedToken = await Helpers.decodeToken(accessToken)

				if (!decodedToken) {
					throw { name: Helpers.RESPONSEERROR.NOTFOUNDPAGE.name, message: Helpers.RESPONSEERROR.NOTFOUNDPAGE.message }
				}

				const { email, username } = decodedToken

				data.email = email
				data.username = username
			} catch (error) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUNDPAGE.name, message: Helpers.RESPONSEERROR.NOTFOUNDPAGE.message }
			}

			return res.render("pages/otp/index", {
				baseUrl,
				...data,
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = {
	OTP,
}
