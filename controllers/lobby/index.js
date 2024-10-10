class Lobby {
	static async index(req, res, next) {
		try {
			res.render("pages/lobby/index")
		} catch (error) {
			next(error)
		}
	}
}

module.exports = Lobby
