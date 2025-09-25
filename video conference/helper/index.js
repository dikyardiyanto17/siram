const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET || "ISULOSTNEMUCODSDRTP"
const bcrypt = require("bcryptjs")

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
	static createdDate = { created_at: new Date(), updated_at: new Date(), last_updated_at: new Date() }

	static async generateRandomId(length = 12, separator = "-", separatorInterval = 4) {
		try {
			const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
			let randomId = ""

			for (let i = 0; i < length; i++) {
				if (i > 0 && i % separatorInterval === 0) {
					randomId += separator
				}

				const randomIndex = Math.floor(Math.random() * characters.length)
				randomId += characters.charAt(randomIndex)
			}

			return randomId
		} catch (error) {
			console.log(error)
		}
	}

	static async formatDate(dateStr) {
		try {
			const date = new Date(dateStr)
			if (isNaN(date.getTime())) {
				return "Invalid Date" // Handle invalid date
			}
			const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
			const formattedDate = date.toLocaleDateString("id-ID", options)
			const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
			return `${formattedDate}, ${formattedTime}`
		} catch (error) {
			console.log(error)
		}
	}

	static async formatedDate(date) {
		try {
			// const date = new Date(oldDate)
			const today = new Date()
			const yesterday = new Date(today)
			yesterday.setDate(today.getDate() - 1)

			const tomorrow = new Date(today)
			tomorrow.setDate(today.getDate() + 1)

			const todayString = today.toDateString()
			const yesterdayString = yesterday.toDateString()
			const tomorrowString = tomorrow.toDateString()
			const dateString = date.toDateString()

			if (dateString == todayString) {
				return "Hari Ini"
			} else if (dateString == yesterdayString) {
				return "Kemarin"
			} else if (dateString == tomorrowString) {
				return "Besok"
			} else {
				const day = String(date.getDate()).padStart(2, "0")
				const month = String(date.getMonth() + 1).padStart(2, "0")
				const year = date.getFullYear()
				return `${day} ${month} ${year}`
			}
		} catch (error) {
			console.log(error)
		}
	}

	static async formatedTime(date) {
		try {
			// const date = new Date(oldDate)
			const hours = String(date.getHours()).padStart(2, "0")
			const minutes = String(date.getMinutes()).padStart(2, "0")
			return `${hours}.${minutes}`
		} catch (error) {
			console.log(error)
		}
	}

	static saveSession(session) {
		return new Promise((resolve, reject) => {
			session.save((err) => {
				if (err) {
					return reject(err)
				}
				resolve()
			})
		})
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

	static async hashPassword(password) {
		try {
			let salt = bcrypt.genSaltSync(10)
			let hash = bcrypt.hashSync(password, salt)
			return (password = hash)
		} catch (error) {
			console.log(error)
		}
	}

	static async comparePassword(inputPassword, password) {
		try {
			let isValidPassword = bcrypt.compareSync(inputPassword, password)
			return isValidPassword
		} catch (error) {
			console.log(error)
		}
	}
}

module.exports = { Helpers }
