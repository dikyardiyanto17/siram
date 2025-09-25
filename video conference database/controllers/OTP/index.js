const { handsOffExp } = require("../../config")
const { Helpers } = require("../../helper")
const Cookies = require("../../schema/Cookies")
const Handoffs = require("../../schema/Handoffs")
const Users = require("../../schema/Users")

class OTP {
	static async post(req, res, next) {
		try {
			const { handsoff } = req.cookies
			const { otpCode } = req.body

			if (!otpCode) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: "OTP is empty" }
			}

			const handsOffDb = await Handoffs.findById(handsoff)
			if (!handsOffDb) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}

			if (handsOffDb.code != otpCode) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: "Invalid Code" }
			}

			const decodedToken = await Helpers.decodeToken(handsOffDb.accessToken)

			if (!decodedToken) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: "Invalid Code" }
			}

			const { email, username } = decodedToken

			const { password } = handsOffDb

			const now = new Date()
			const onInsert = {
				userId: await Helpers.generateUUIDv4(),
				username: username,
				email,
				createdAt: now,
				updatedAt: now,
				fullname: username,
				password,
			}

			const existingUser = await Users.findOne({ email })

			if (existingUser) {
				throw { name: Helpers.RESPONSEERROR.DUPLICATED.name, message: "User is already registered" }
			}

			const user = await Users.create(onInsert)

			const cookie = await Helpers.generateCrypto({ length: 30 })

			const saveCookie = await Cookies.create({
				cookieId: cookie.cookie,
				createdBy: await user._id.toString(),
			})

			res.cookie("userCookie", cookie.cookie, {
				expires: cookie.exp,
				...Helpers.cookieSetting,
			})

			await handsOffDb.deleteOne()

			await res.status(200).json({ status: true, message: "OTP Success", data: [] })
		} catch (error) {
			next(error)
		}
	}

	static async detail(req, res, next) {
		try {
			const { handsoff } = req.cookies
			if (!handsoff) {
				throw { name: Helpers.RESPONSEERROR.UNAUTHORIZED.name, message: "No OTP session found" }
			}

			const handsOffDb = await Handoffs.findById(handsoff)
			if (!handsOffDb) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: "OTP session not found" }
			}

			await res.status(200).json({ status: true, message: "Successfully retrieved OTP", data: [{ accessToken: handsOffDb.accessToken }] })
		} catch (error) {
			next(error)
		}
	}

	static async resendOtp(req, res, next) {
		try {
			const { handsoff } = req.cookies
			if (!handsoff) {
				throw { name: Helpers.RESPONSEERROR.UNAUTHORIZED.name, message: "No OTP session found" }
			}

			const handsOffDb = await Handoffs.findById(handsoff)
			if (!handsOffDb) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: "OTP session not found" }
			}

			// Check cooldown (60 seconds after createdAt)
			const cooldownMs = 60 * 1000
			const availableAt = new Date(handsOffDb.createdAt).getTime() + cooldownMs
			if (Date.now() < availableAt) {
				const waitSeconds = Math.ceil((availableAt - Date.now()) / 1000)
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: `Please wait ${waitSeconds}s before requesting a new OTP` }
			}

			// Create new OTP entry
			const newOtp = await Handoffs.create({
				password: handsOffDb.password,
				code: await Helpers.generateOTP(),
				accessToken: handsOffDb.accessToken,
			})

			// Remove old OTP record
			await handsOffDb.deleteOne()

			// Reset cookie with new OTP id
			res.clearCookie("handsoff", Helpers.cookieSetting)
			res.cookie("handsoff", newOtp._id.toString(), Helpers.cookieSetting)

			res.cookie("handsoff", await newOtp._id.toString(), {
				expires: new Date(Date.now() + handsOffExp),
				...Helpers.cookieSetting,
			})

			// Send response
			return res.status(200).json({
				status: true,
				message: "OTP resent successfully",
				data: [],
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = { OTP }
