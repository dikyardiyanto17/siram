const { google } = require("googleapis")
const crypto = require("crypto")
const { v4: uuidv4 } = require("uuid")
const { googleRedirectApi, googleScope } = require("../../config")
const Handoffs = require("../../schema/Handoffs")
const Users = require("../../schema/Users")

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
				throw { name: "forbidden", message: "Unauthorized user!" }
			}

			const { tokens } = await oauth2Client.getToken(codeFromQuery)
			await oauth2Client.setCredentials(tokens)

			const accessToken = tokens.access_token
			if (!accessToken) {
				throw { name: "forbidden", message: "No access_token returned by Google!" }
			}

			const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
			const { data: userInfo } = await oauth2.userinfo.get()
			const { email, name, picture, id: googleId, sub } = userInfo

			const googleSub = sub || googleId
			const handoffCode = crypto.randomUUID()

			await Handoffs.findOneAndUpdate(
				{ email },
				{
					code: handoffCode,
					accessToken,
					email,
					expiresAt: new Date(Date.now() + 60 * 1000),
				},
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			)

			const now = new Date()
			const onInsert = {
				userId: uuidv4(),
				username: name || email.split("@")[0],
				email,
				authProvider: "google",
				googleId: googleSub,
				picture,
				createdAt: now,
				updatedAt: now,
			}

			const onUpdate = {
				googleId: googleSub,
				picture,
				authProvider: "google",
				updatedAt: now,
			}

			const existingUser = await Users.findOne({ email })

			if (!existingUser) {
				await Users.create(onInsert)
			} else {
				await Users.updateOne({ email }, { $set: onUpdate })
			}

			const vcUrl = res.locals.videoConferenceUrl
			return res.redirect(`${vcUrl}/?code=${encodeURIComponent(handoffCode)}`)
		} catch (error) {
			return next(error)
		}
	}

	static async getGoogleAccessToken(req, res, next) {
		try {
			const authHeader = req.headers.authorization

			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				throw { name: "forbidden", message: "Unauthorized user!" }
			}

			
			const code = authHeader.split(" ")[1]
			const handoff = await Handoffs.findOne({ code })

			if (!handoff) {
				throw { name: "forbidden", message: "Session is expired!" }
			}

			const user = await Users.findOne({ email: handoff.email })

			if (!user) {
				throw { name: "not_found", message: "User not found!" }
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
