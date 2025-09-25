const { handsOffExp, videoConferenceUrl } = require("../../config")
const { Helpers } = require("../../helper")
const Cookies = require("../../schema/Cookies")
const Handoffs = require("../../schema/Handoffs")
const Users = require("../../schema/Users")
const { Types } = require("mongoose")

class User {
	// Sign In
	static async get(req, res, next) {
		try {
		} catch (error) {
			next(error)
		}
	}

	// Sign Up
	static async post(req, res, next) {
		try {
			const { username, password, email, repeatedPassword } = req.body

			if (!username || !password || !email || !repeatedPassword) {
				throw {
					name: Helpers.RESPONSEERROR.BADREQUEST.name,
					message: Helpers.RESPONSEERROR.BADREQUEST.message,
				}
			}

			// password validation:
			// - min 8 characters
			// - at least 1 uppercase
			// - at least 1 lowercase
			// - at least 1 digit
			// - at least 1 special character
			const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

			if (!passwordRegex.test(password)) {
				throw {
					name: Helpers.RESPONSEERROR.BADREQUEST.name,
					message: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and symbol",
				}
			}

			if (password != repeatedPassword) {
				throw {
					name: Helpers.RESPONSEERROR.BADREQUEST.name,
					message: "Password and repeated password do not match",
				}
			}

			const user = await Users.findOne({ email })

			if (user) {
				throw {
					name: Helpers.RESPONSEERROR.INVALIDUSER.name,
					message: "Email is already registered, please use another one",
				}
			}

			const token = await Helpers.encodeToken({ email, username })

			const onCreate = {
				accessToken: token,
				password: await Helpers.hashPassword(password),
				code: await Helpers.generateOTP(),
			}

			const handsOff = await Handoffs.create(onCreate)

			res.cookie("handsoff", await handsOff._id.toString(), {
				expires: new Date(Date.now() + handsOffExp),
				...Helpers.cookieSetting,
			})

			res.status(201).json({
				status: true,
				message: "Sending OTP!",
				data: [{ link: `${videoConferenceUrl}/otpverification` }],
			})
		} catch (error) {
			next(error)
		}
	}

	static async detail(req, res, next) {
		try {
			const { userCookie } = req.cookies
			const cookie = await Cookies.findOne({ cookieId: userCookie })
			const validMongodbId = Types.ObjectId.isValid(cookie.createdBy)

			console.log(req.user)

			if (!validMongodbId) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}
			const user = await Users.findById(cookie.createdBy).select("-password").lean()
			await res.status(200).json({
				status: true,
				data: [{ accessToken: cookie.token, user: { ...user } }],
				message: "Authenticated User",
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = {
	User,
}
