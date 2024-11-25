const { decodeToken } = require("../helper/jwt")

const authorization
 = async (req, res, next) => {
	try {
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = authorization

