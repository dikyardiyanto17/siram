const { Helpers } = require("../../helper")
const Cookies = require("../../schema/Cookies")
const Users = require("../../schema/Users")

class Auth {
	static async login(req, res, next) {
		try {
			const { email, password } = req.body
			if (!email || !password) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}
			const user = await Users.findOne({ email: email })
			if (!user) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}
			const isMatch = await Helpers.comparePassword(password, user.password)
			if (!isMatch) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}

			const cookie = await Helpers.generateCrypto({ length: 30 })
			res.cookie("userCookie", cookie.cookie, {
				expires: cookie.exp,
				...Helpers.cookieSetting,
			})
			const cookies = await Cookies.create({ cookieId: cookie.cookie, createdBy: user._id })
			await res.status(200).json({
				status: true,
				message: "Successfully login",
				data: [],
			})
		} catch (error) {
			next(error)
		}
	}

	static async postOtp(req, res, next) {
		try {
		} catch (error) {
			next(error)
		}
	}
}
module.exports = { Auth }
