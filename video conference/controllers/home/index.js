const { baseUrl } = require("../../config/index.js")
const axios = require("axios")

class Home {
	static async index(req, res, next) {
		try {
			const { code } = req.query
			if (code) {
				const request = await axios.get(`${res.locals.databaseUrl}/api/google/access_token`, {
					headers: {
						Authorization: `Bearer ${code}`,
					},
				})

				if (request && request.data) {
					const { accessToken, email, user } = request.data
					if (accessToken && user) {
						const googleInfo = {
							token: accessToken,
							email: user.email,
							name: user.username,
							picture: user.picture,
						}
						req.session.google = { ...googleInfo }
						return req.session.save((err) => {
							if (err) return next(err)
							return res.redirect(baseUrl)
						})
					}
				}

				return res.redirect(baseUrl)
			} else {
				const google = req.session?.google || null
				return res.render("pages/home/index", {
					baseUrl,
					authority: 1,
					isLogin: !!google,
					...(google
						? { username: google.name, picture: google.picture }
						: { username: "Unknown", picture: `${baseUrl}/assets/pictures/avatar.png` }),
				})
			}
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
