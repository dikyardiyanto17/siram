const { baseUrl } = require("../../config/index.js")

class Home {
	static async index(req, res, next) {
		try {
			await res.render("pages/home/index", {
				authority: 1,
				baseUrl,
			})
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
