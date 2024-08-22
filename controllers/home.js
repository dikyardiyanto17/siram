class ControllerHome {
	static home(req, res) {
		try {
			res.render("home")
		} catch (error) {
			console.log(error)
		}
	}
}
module.exports = ControllerHome
