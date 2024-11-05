const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET || "ISULOSTNEMUCODSDRTP"

const encodeToken = (payload) => {
	return jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, secret)
}

const decodeToken = (token) => {
	return jwt.verify(token, secret)
}

module.exports = { encodeToken, decodeToken }
