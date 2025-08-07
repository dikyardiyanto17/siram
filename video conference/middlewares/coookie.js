const cookie = (req, res, next) => {
	try {
		req.cookieSession = req.session || {}
		delete req.session
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = cookie
