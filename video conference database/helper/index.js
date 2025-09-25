const bcrypt = require("bcryptjs")
const cryptos = require("crypto")
const { v4: uuidv4 } = require("uuid")
const { cookieUser } = require("../config")
const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET_MEETING || "ISULOSTNEMUCODSDRTP"

class Helpers {
	static RESPONSEERROR = {
		GUESTUSERERROR: {
			status: 403,
			name: "GUESTERROR",
			message: "Invalid user, please login first",
		},
		NOTFOUND: {
			status: 404,
			name: "NOTFOUND",
			message: "Data is not found",
		},
		FORBIDDEN: {
			status: 403,
			name: "FORBIDDEN",
			message: "Unauthorized access",
		},
		DUPLICATED: {
			status: 403,
			name: "DUPLICATED",
			message: "Data is duplicated",
		},
		VALIDATIONERROR: {
			status: 401,
			name: "ValidationError",
			message: "Data is duplicated",
		},
		NOTFOUNDPAGE: {
			status: 401,
			name: "NOTFOUNDPAGE",
			message: "Page is not found",
		},
		JSONWEBTOKEN: {
			status: 401,
			name: "JsonWebTokenError",
			message: "Invalid User",
		},
		INVALIDUSER: {
			status: 401,
			name: "INVALID",
			message: "Invalid User",
		},
		CASTERROR: {
			status: 401,
			name: "CastError",
			message: "Bad reques",
		},
		BADREQUEST: {
			status: 400,
			name: "BADREQUEST",
			message: "Bad request",
		},
		INTERNALSERVERERROR: {
			status: 500,
			name: "INTERNALSERVERERROR",
			message: "Internal Server Error",
		},
	}
	static cookieSetting = {
		path: "/",
		sameSite: "none",
		secure: true,
	}
	static async hashPassword(password) {
		try {
			let salt = await bcrypt.genSaltSync(10)
			let hash = await bcrypt.hashSync(password, salt)
			return (password = hash)
		} catch (error) {
			console.log(error)
		}
	}

	static async comparePassword(inputPassword, password) {
		try {
			let isValidPassword = await bcrypt.compareSync(inputPassword, password)
			return isValidPassword
		} catch (error) {
			console.log(error)
		}
	}

	static async generateCrypto({ length = 30 }) {
		try {
			return {
				cookie: cryptos
					.randomBytes(Math.ceil(length / 2))
					.toString("hex")
					.slice(0, length),
				exp: new Date(Date.now() + cookieUser),
			}
		} catch (error) {
			console.log(error)
		}
	}

	static async generateUUIDv4() {
		try {
			return await uuidv4()
		} catch (error) {
			console.log(error)
		}
	}

	static async generateOTP() {
		return Math.floor(100000 + Math.random() * 900000).toString()
	}

	static async encodeToken(payload) {
		try {
			return jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, secret)
		} catch (error) {
			console.log(error)
		}
	}

	static async decodeToken(token) {
		try {
			return jwt.verify(token, secret)
		} catch (error) {
			console.log(error)
		}
	}
}

module.exports = { Helpers }
