const Cookies = require("../schema/Cookies")
const axios = require("axios")
const Users = require("../schema/Users")
const { appName, baseUrl, videoConferenceUrl, googleOauthUrl } = require("../config")
const { Helpers } = require("../helper")
const { Types } = require("mongoose")
const Meetings = require("../schema/Meetings")
const Handoffs = require("../schema/Handoffs")

class Middlewares {
	static async configuration(req, res, next) {
		try {
			res.locals.appName = appName
			res.locals.baseUrl = baseUrl
			res.locals.videoConferenceUrl = videoConferenceUrl
			res.locals.googleOauthUrl = googleOauthUrl
			next()
		} catch (error) {
			next(error)
		}
	}

	static async authorization(req, res, next) {
		try {
			const { roomToken } = req.cookies

			// Check required cookies
			if (!roomToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const decodedRoomToken = await Helpers.decodeToken(roomToken)

			if (!decodedRoomToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			req.room = { ...decodedRoomToken }
			next()
		} catch (error) {
			next(error)
		}
	}

	// It must pass the middlewares of authentication
	static async roomAuthorization(req, res, next) {
		try {
			const { roomId, roomPassword } = req.room
			const room = await Meetings.findOne({ roomId: roomId })
			if (!room) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.NOTFOUND.message }
			}

			if (room.roomPassword != roomPassword) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const isAuthorized = room.participants.find((x) => x._id == req.user._id.toString())
			if (!isAuthorized) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Unathorized access" }
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	// It must pass the middlewares of authentication
	static async roomHostAuthorization(req, res, next) {
		try {
			const { roomId } = req.room
			const room = await Meetings.findOne({ roomId: roomId })
			if (!room) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: Helpers.RESPONSEERROR.NOTFOUND.message }
			}
			const validMongodbId = Types.ObjectId.isValid(req.user._id)

			if (!validMongodbId) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const isAuthorized = room.participants.find((x) => x._id == req.user._id.toString() && req.user._id.toString() == x.hostId)

			if (!isAuthorized) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Unathorized access" }
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	static async authentication(req, res, next) {
		try {
			const { roomToken } = req.cookies

			// Check required cookies
			if (!roomToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const decodedRoomToken = await Helpers.decodeToken(roomToken)

			if (!decodedRoomToken) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			req.room = { ...decodedRoomToken }
			next()
		} catch (error) {
			next(error)
		}
	}

	static async googleAuth(req, res, next) {
		try {
			const authHeader = req.headers.authorization

			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return res.status(403).json({ message: "Unauthorized user!" })
			}

			const token = authHeader.split(" ")[1]

			const googleResponse = await axios.get(`${res.locals.googleOauthUrl}/tokeninfo?access_token=${token}`)
			const googleData = googleResponse.data

			if (!googleData || !googleData.email) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Unauthorized user!" }
			}

			const user = await Users.findOne({ email: googleData.email })

			if (!user) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Unauthorized user" }
			}

			req.googleUser = {
				email: googleData.email,
				sub: googleData.sub,
				expires_in: googleData.expires_in,
				token,
			}

			req.user = user
			next()
		} catch (error) {
			if (error.response && error.response.status === 400) {
				return res.status(401).json({ message: "Invalid or expired Google token" })
			}
			next(error)
		}
	}

	// Instant Meeting Cookie Handler
	// Create new user
	static async cookieHandler(req, res, next) {
		try {
			const { username } = req.body
			if (!username) {
				throw { name: Helpers.RESPONSEERROR.BADREQUEST.name, message: Helpers.RESPONSEERROR.BADREQUEST.message }
			}

			// Guest Handling
			if (!req.cookies.userCookie) {
				const guestUser = {
					username,
					userId: await Helpers.generateUUIDv4(),
					_id: await Helpers.generateUUIDv4(),
					authProvider: "guest",
					fullname: username,
				}

				const guestToken = await Helpers.encodeToken(guestUser)
				const cookie = await Helpers.generateCrypto({ length: 30 })
				const saveCookie = await Cookies.create({ cookieId: cookie.cookie, createdBy: guestUser._id, token: guestToken })
				res.cookie("userCookie", cookie.cookie, {
					expires: cookie.exp,
					...Helpers.cookieSetting,
				})

				req.user = {
					...guestUser,
				}
				return next()
			}

			const userCookies = await Cookies.findOne({ cookieId: req.cookies.userCookie })

			if (!userCookies) {
				res.clearCookie("userCookie", Helpers.cookieSetting)
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Invalid user, please relog!" }
			}

			const validMongodbId = Types.ObjectId.isValid(userCookies.createdBy)

			// User is not registered (Guest User)
			if (!validMongodbId) {
				const { token } = userCookies
				if (!token) {
					throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
				}

				const decodedToken = await Helpers.decodeToken(token)
				if (!decodedToken) {
					throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
				}

				const { username: usernameJwt } = decodedToken

				req.user = {
					...decodedToken,
				}

				if (username != usernameJwt) {
					const newToken = await Helpers.encodeToken({ ...decodedToken, username: username })

					await Object.assign(userCookies, { token: newToken })
					await userCookies.save()

					req.user = {
						...decodedToken,
						username: username,
					}
				}

				return next()
			}

			const user = await Users.findById(userCookies.createdBy).select("-password")

			if (!user) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Invalid user, please relog!" }
			}

			if (user.authProvider == "guest") {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: "Invalid user, please relog!" }
			}

			req.user = { ...(await user.toObject()) }

			next()
		} catch (error) {
			next(error)
		}
	}

	static async cookieAuth(req, res, next) {
		try {
			const { userCookie } = req.cookies

			// Check required cookies
			if (!userCookie) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			// Validate cookie in DB
			const savedCookie = await Cookies.findOne({ cookieId: userCookie })
			if (!savedCookie) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			const validMongodbId = Types.ObjectId.isValid(savedCookie.createdBy)

			if (!validMongodbId) {
				const { token } = savedCookie
				if (!token) {
					throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
				}

				const decodedToken = await Helpers.decodeToken(token)
				if (!decodedToken) {
					throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
				}
				req.user = {
					...decodedToken,
				}
				return next()
			}

			const user = await Users.findById(savedCookie.createdBy).select("-password")
			if (!user) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}

			req.user = {
				...(await user.toObject()),
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	// Delete Handsoff if is exist
	static async registerCookie(req, res, next) {
		try {
			const { handsoff } = req.cookies

			if (handsoff) {
				console.log("Deleted", handsoff)
				await Handoffs.deleteOne({ _id: handsoff })
				res.clearCookie("handsoff", Helpers.cookieSetting)
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	// Check OTP Cookie Cookies
	static async otpCookie(req, res, next) {
		try {
			const { handsoff } = req.cookies
			if (!handsoff) {
				throw { name: Helpers.RESPONSEERROR.FORBIDDEN.name, message: Helpers.RESPONSEERROR.FORBIDDEN.message }
			}
			next()
		} catch (error) {
			next(error)
		}
	}

	static async errorHandlers(err, req, res, next) {
		console.log("- ErrorName : ", err.name)
		console.log("- ErrorMessage : ", err.message)
		console.log("- Error : ", err)

		let statusCode = 500
		let name = "Internal Server Error"
		let message = err.message

		switch (true) {
			case err.name === Helpers.RESPONSEERROR.BADREQUEST.name:
			case err.name === Helpers.RESPONSEERROR.VALIDATIONERROR.name:
				statusCode = 400
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.INVALIDUSER.name:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.FORBIDDEN.name:
			case err.name === Helpers.RESPONSEERROR.GUESTUSERERROR.name:
				statusCode = 403
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.DUPLICATED.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUND.name:
				statusCode = 404
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.JSONWEBTOKEN:
				statusCode = 401
				name = err.name
				break

			case err.name === Helpers.RESPONSEERROR.CASTERROR.name:
			case err.name === Helpers.RESPONSEERROR.NOTFOUNDPAGE.name:
				statusCode = 401
				name = err.name
				break
		}

		res.status(statusCode).json({ status: false, name, message })
	}
}

module.exports = { Middlewares }
