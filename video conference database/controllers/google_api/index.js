const { google } = require("googleapis")
const crypto = require("crypto")
const { googleRedirectApi, googleScope } = require("../../config")
const Handoffs = require("../../schema/Handoffs")
const Users = require("../../schema/Users")
const { Helpers } = require("../../helper")
const Cookies = require("../../schema/Cookies")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectApi)

class GoogleApi {
	static async createToken(req, res, next) {
		try {
			const url = oauth2Client.generateAuthUrl({
				access_type: "offline",
				prompt: "consent",
				scope: googleScope,
			})
			return res.redirect(url)
		} catch (error) {
			return next(error)
		}
	}

	static async googleCallback(req, res, next) {
		try {
			const codeFromQuery = req.query.code
			if (!codeFromQuery) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const { tokens } = await oauth2Client.getToken(codeFromQuery)
			const { refresh_token } = tokens
			await oauth2Client.setCredentials(tokens)

			const accessToken = tokens.access_token
			if (!accessToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "No access token returned by Google!" }
			}

			const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
			const { data: userInfo } = await oauth2.userinfo.get()
			const { email, name, picture, id: googleId, sub } = userInfo

			const googleSub = sub || googleId

			const now = new Date()
			const onInsert = {
				userId: await Helpers.generateUUIDv4(),
				username: name || email.split("@")[0],
				email,
				authProvider: "google",
				googleId: googleSub,
				picture,
				createdAt: now,
				updatedAt: now,
				fullname: name || email.split("@")[0],
				refreshToken: refresh_token,
			}

			const onUpdate = {
				googleId: googleSub,
				picture,
				authProvider: "google",
				updatedAt: now,
				refreshToken: refresh_token,
			}

			const existingUser = await Users.findOne({ email })

			let user

			if (!existingUser) {
				user = await Users.create(onInsert)
			} else {
				user = await Users.findOneAndUpdate({ email }, { $set: onUpdate }, { new: true })
			}

			const cookie = await Helpers.generateCrypto({ length: 30 })

			const saveCookie = await Cookies.create({
				cookieId: cookie.cookie,
				createdBy: await user._id.toString(),
				token: accessToken,
				loginPlatform: "Google",
			})

			res.cookie("userCookie", cookie.cookie, {
				expires: cookie.exp,
				...Helpers.cookieSetting,
			})

			const vcUrl = res.locals.videoConferenceUrl
			return res.redirect(`${vcUrl}`)
		} catch (error) {
			return next(error)
		}
	}

	static async getGoogleAccessToken(req, res, next) {
		try {
			const authHeader = req.headers.authorization

			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const code = authHeader.split(" ")[1]
			const handoff = await Handoffs.findOne({ code })

			if (!handoff) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Session is expired!" }
			}

			const user = await Users.findOne({ email: handoff.email })

			if (!user) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.NOTFOUND.message }
			}

			return res.status(200).json({
				accessToken: handoff.accessToken,
				email: handoff.email,
				user: {
					userId: user.userId,
					username: user.username,
					email: user.email,
					authProvider: user.authProvider,
					picture: user.picture,
				},
			})
		} catch (error) {
			next(error)
		}
	}
}

module.exports = GoogleApi
