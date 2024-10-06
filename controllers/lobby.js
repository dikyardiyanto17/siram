class Lobby {
	static async index(req, res, next) {
		try {
			res.render("lobby")
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Lobby
