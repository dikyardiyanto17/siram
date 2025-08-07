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
							name: user.name,
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
					authority: 1,
					baseUrl,
					isLogin: google ? true : false,
				})
			}
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
