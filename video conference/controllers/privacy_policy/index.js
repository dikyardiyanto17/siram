const { baseUrl } = require("../../config/index.js")

class PrivacyPolicy {
	static async index(req, res, next) {
		try {
			const google = req.session?.google || null
			return res.render("pages/privacy_policy/index", {
				baseUrl,
				authority: 1,
				isLogin: !!google,
				...(google ? { username: google.name, picture: google.picture } : { username: "Unknown", picture: `${baseUrl}/assets/pictures/avatar.png` }),
			})
		} catch (error) {
			next(error)
		}
	}
}
module.exports = PrivacyPolicy
