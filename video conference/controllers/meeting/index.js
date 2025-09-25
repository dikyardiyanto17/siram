class Meeting {
	static async index(req, res, next) {
		try {
			res.render("pages/meeting/index", {
				picture: "P_0000000",
			})
		} catch (error) {
			next(error)
		}
	}
}
module.exports = Meeting
