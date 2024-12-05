class Home {
	static async index(req, res, next) {
		try {
			const { picture } = req.user
			await res.render("pages/home/index", {
				authority: req.user.authority,
				participant_id: req.user.participant_id,
				token: req.session.token,
				picture,
			})
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Home
