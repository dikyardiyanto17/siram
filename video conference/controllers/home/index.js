const { baseUrl } = require("../../config/index.js")
const axios = require("axios")

class Home {
	static async index(req, res, next) {
		try {
			const { userCookie } = req.cookies

			if (userCookie) {
				try {
					const response = await axios.get(`${res.locals.databaseUrl}/auth/user/detail`, {
						headers: {
							Cookie: req.headers.cookie,
						},
					})

					if (response?.data?.status) {
						const { user } = response.data.data[0]
						if (user) {
							return res.render("pages/home/index", {
								baseUrl,
								isLogin: true,
								username: user.username,
								picture: user.picture,
								email: user.email,
							})
						}
					}
				} catch (error) {
					console.log("- Error Auth on DB : ", error)
				}
			}

			return res.render("pages/home/index", {
				baseUrl,
				isLogin: false,
				username: "",
				picture: "",
				email: "",
			})
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
