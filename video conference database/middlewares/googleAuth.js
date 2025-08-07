const axios = require("axios")
const Users = require("../schema/Users")

const googleAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(403).json({ message: "Unauthorized user!" })
		}

		const token = authHeader.split(" ")[1]

		const googleResponse = await axios.get(`${res.locals.googleOauthUrl}/tokeninfo?access_token=${token}`)
		const googleData = googleResponse.data

		if (!googleData || !googleData.email) {
			throw { name: "forbidden", message: "Unauthorized user!" }
		}

		const user = await Users.findOne({ email: googleData.email })

		if (!user) {
			throw { name: "forbidden", message: "Unauthorized user" }
		}

		req.googleUser = {
			email: googleData.email,
			sub: googleData.sub,
			expires_in: googleData.expires_in,
			token,
		}

		req.user = user
		next()
	} catch (error) {
		if (error.response && error.response.status === 400) {
			return res.status(401).json({ message: "Invalid or expired Google token" })
		}
		next(error)
	}
}

module.exports = googleAuth
