require("dotenv").config()
const { url, port, isHttps, encodedLimit, expressSessionConfiguration, socketPath } = require("./config/index.js")

const ejs = require("ejs")
ejs.delimiter = "/"
ejs.openDelimiter = "["
ejs.closeDelimiter = "]"

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const router = require("./routes/index.js")
const app = express()
const { options } = require("./certif")
const http = require("http")
const path = require("path")
const https = require("httpolyglot")
const { Server } = require("socket.io")
const { MediaSoup } = require("./server_parameter/mediasoup.js")
const { LiveMeeting } = require("./server_parameter/live_meeting.js")
const { Helpers } = require("./helper/index.js")
const { Middlewares } = require("./middlewares/index.js")

app.use(cookieParser())
app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ limit: encodedLimit, extended: true }))
app.use(express.json({ limit: encodedLimit }))

app.use(express.static("public"))
app.use(url, express.static(path.join(__dirname, "public")))

const sessionMiddleware = session({
	secret: process.env.EXPRESS_SESSION_SECRET || "ISULOSTNEMUCODSDRTPSESSION",
	...expressSessionConfiguration,
})

// const myCookieSession = cookieSession({
// 	name: "cookie_sess",
// 	keys: [process.env.COOKIE_KEY_1 || "dev-cookie-key-1", process.env.COOKIE_KEY_2 || "dev-cookie-key-2"],
// 	maxAge: 24 * 60 * 60 * 1000,
// 	httpOnly: false,
// 	sameSite: "lax",
// 	secure: false
// })

app.set("trust proxy", 1)

app.use(Middlewares.configuration)
// app.use(myCookieSession)
// app.use(cookie)
app.use(sessionMiddleware)
// app.use(cookieSessionMiddleware)

let mediasoupVariable = new MediaSoup()
let liveMeeting = new LiveMeeting()
// if (mediasoupVariable.workers.length == 0) {
// 	mediasoupVariable.createWorker()
// }
let io
if (isHttps) {
	const httpsServer = https.createServer(options, app)
	httpsServer.listen(port, async () => {
		console.log("App On : " + port)
	})
	io = new Server(httpsServer, {
		path: socketPath,
	})
} else {
	const httpServer = http.createServer(app)
	httpServer.listen(port, async () => {
		console.log("App On : " + port)
	})
	io = new Server(httpServer, {
		path: socketPath,
	})
}

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res || {}, next)
})

io.on("connection", async (socket) => {
	socket.decodeJWt = Helpers.decodeToken
	const userSession = socket.request.session
	socket.on("disconnect", async () => {
		try {
			const user = await liveMeeting.findUserBySocket({ socketId: socket.id })
			if (user) {
				await mediasoupVariable.deleteAndCloseUser({ userId: user.participantId })
				await liveMeeting.deleteUser({ socket, userSession })
			}
		} catch (error) {
			console.log("- Error Disconnecting Socket : ", error)
		}
	})

	socket.on("viewer-joined", async ({ roomId, id, username }) => {
		try {
			await liveMeeting.informViewer({ roomId, userId: id, socket, username })
		} catch (error) {
			console.log("- Error viewer joined : ", error)
		}
	})

	socket.on("viewer-joined-feedback", async ({ socketId, id, username }) => {
		try {
			socket.to(socketId).emit("viewer-joined-feedback", { socketId, id, username })
		} catch (error) {
			console.log("- Error viewer joined : ", error)
		}
	})

	socket.on("joining-room", async ({ userId, roomId, isViewer = false, token, password, username, meetingType = 2 }, callback) => {
		try {
			const decodedToken = await socket.decodeJWt(token)
			if (!decodedToken) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: Helpers.RESPONSEERROR.INVALIDUSER.message }
			}

			console.log("- Decoded Token : ", decodedToken)

			const { hostId } = decodedToken

			const isValidRoom = await liveMeeting.isValidRoom({ roomId, password })
			if (isValidRoom == 2) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: "Invalid Credential" }
			}

			const user = await liveMeeting.findUser({ roomId, userId })

			// Get routers
			const router = await mediasoupVariable.getRouter({ roomId: roomId })
			const rtpCapabilities = router.rtpCapabilities

			const waitingList = await liveMeeting.getWaitingList({ roomId: roomId })

			if (user) {
				if (user.waiting && meetingType == 1) {
					callback({
						status: false,
						roomId: roomId,
						userId: userId,
						authority: hostId == userId ? 1 : 3,
						rtpCapabilities,
						username: username,
						meeting_type: meetingType,
						isViewer,
						message: "User is still waiting for approval",
					})
					return
				}
				await liveMeeting.updateUser(
					{ participantId: userId, roomId: roomId },
					{ processDeleteUser: false, verified: true, joined: true, socketId: socket.id, waiting: false }
				)

				callback({
					status: true,
					roomId: roomId,
					userId: userId,
					authority: hostId == userId ? 1 : 3,
					rtpCapabilities,
					username: username,
					meeting_type: meetingType,
					isViewer,
					...(userId == hostId && { waitingList }),
				})
				return
			}

			await liveMeeting.addUser({
				participantId: userId,
				roomId: roomId,
				socketId: socket.id,
				authority: hostId == userId ? 1 : 3,
				username: username,
				picture: "P_0000000",
				meetingType: meetingType,
				isViewer: isViewer,
				joined: true,
				verified: true,
				waiting: false,
				password: password,
			})

			callback({
				status: true,
				roomId: roomId,
				userId: userId,
				authority: hostId == userId ? 1 : 3,
				rtpCapabilities,
				username: username,
				meeting_type: meetingType,
				isViewer,
				...(userId == hostId && { waitingList }),
			})
		} catch (error) {
			callback({ status: false, message: error?.message || "Socket Error Joining Room!" })
			console.log("- Error Joining Room : ", error)
		}
	})

	socket.on("joining-room-lobby", async ({ userId, roomId, isViewer = false, password, username, meetingType }, callback) => {
		try {
			const isValidRoom = await liveMeeting.isValidRoom({ roomId, password })
			if (isValidRoom == 2) {
				throw { name: Helpers.RESPONSEERROR.INVALIDUSER.name, message: "Invalid Credential" }
			}

			const user = await liveMeeting.findUser({ roomId, userId })
			const admins = await liveMeeting.findAdmin({ roomId: roomId })
			if (!user) {
				const picture = "P_0000000"
				await liveMeeting.addUser({
					participantId: userId,
					roomId: roomId,
					socketId: socket.id,
					authority: 3,
					username: username,
					picture: picture,
					meetingType: meetingType,
					isViewer: isViewer,
					joined: false,
					verified: false,
					waiting: true,
					password: password,
				})
				admins.forEach((u) => {
					socket.to(u.socketId).emit("member-joining-room", { id: userId, socketId: socket.id, username, picture })
				})
				callback({ status: false })
				return
			}

			if (user && user.waiting) {
				admins.forEach((u) => {
					socket.to(u.socketId).emit("member-joining-room", { id: userId, socketId: socket.id, username, picture })
				})
				callback({ status: false })
				return
			}

			if (user && user.verified) {
				callback({ status: true })
				return
			}
			callback({ status: false })
		} catch (error) {
			callback({ status: false, message: error?.message || "Socket Error Joining Room!" })
			console.log("- Error Joining Room : ", error)
		}
	})

	socket.on("response-member-waiting", async ({ response, id, roomId }) => {
		try {
			const user = await liveMeeting.findUser({ roomId, userId: id })
			if (!user) {
				throw { name: Helpers.RESPONSEERROR.NOTFOUND.name, message: "Room is not found" }
			}

			await liveMeeting.updateUser({ participantId: id, roomId: roomId }, { verified: response, waiting: !response })

			socket.to(user.socketId).emit("response-member-waiting", { response, roomId: roomId, id })

			if (!response) {
				await liveMeeting.deleteUserRejected({ userId: id, roomId: user.roomId })
			}
		} catch (error) {
			console.log("- Error Response Member Waiting : ", error)
		}
	})

	socket.on("rejected-response", async ({ id }) => {
		try {
			userSession.roomId = null
			userSession.password = null
			userSession.roomName = null
			userSession.meetingType = null
			await Helpers.saveSession(userSession)
		} catch (error) {
			console.log("- Error Id : ", error)
		}
	})

	socket.on("producer-app-data", async ({ producerId, isActive }) => {
		try {
			await mediasoupVariable.changeProducerAppData({ producerId, isActive })
		} catch (error) {
			console.log("- Error Producer App Data : ", error)
		}
	})

	socket.on("user-list", async ({ type, userId, to, isActive }) => {
		try {
			socket.to(to).emit("user-list", { type, userId, isActive })
		} catch (error) {
			console.log("- Error On User List : ", error)
		}
	})

	socket.on("message", ({ userId, to, message, username, picture, type, id, chatTo, resend = false }) => {
		try {
			socket.to(to).emit("message", { userId, message, username, picture, type, id, chatTo, resend })
		} catch (error) {
			console.log("- Error Send Message : ", error)
		}
	})

	socket.on("message-donwload-link", ({ userId, to, id, api, status, type }) => {
		try {
			socket.to(to).emit("message-donwload-link", { userId, id, api, status, type })
		} catch (error) {
			console.log("- Error Send Message : ", error)
		}
	})

	// Mediasoup Socket
	socket.on("create-webrtc-transport", async ({ consumer, roomId, userId }, callback) => {
		try {
			let { transport } = await mediasoupVariable.createWebRTCTransport({ roomId, userId, consumer, socketId: socket.id })

			callback({
				params: {
					id: transport.id,
					iceParameters: transport.iceParameters,
					iceCandidates: transport.iceCandidates,
					dtlsParameters: transport.dtlsParameters,
					iceServers: [...mediasoupVariable.turnServer],
				},
			})
		} catch (error) {
			console.log("- Error Creating WebRTC Transport : ", error)
		}
	})

	socket.on("transport-produce", async ({ kind, rtpParameters, appData, roomId, userId }, callback) => {
		try {
			rtpParameters.rtcp = { reducedSize: true }
			const producer = await mediasoupVariable.createProducer({ userId, kind, rtpParameters, appData, roomId, socketId: socket.id })
			if (!appData.isActive) {
				await producer.pause()
			}
			await liveMeeting.informUser({ roomId, producerId: producer.id, socket, userId, producerPaused: producer.paused })
			const user = await liveMeeting.findUser({ roomId, userId })
			if (kind == "audio") {
				liveMeeting.users.forEach((u) => {
					if (u.participantId != userId && u.roomId == roomId && u.joined && u.verified && !u.waiting) {
						socket.to(u.socketId).emit("new-user-notification", { username: user.username, picture: appData.picture })
					}
				})
			}

			const isUserExist = await liveMeeting.checkTheRoom({ roomId, userId })

			callback({ kind, id: producer.id, producersExist: isUserExist ? true : false })
		} catch (error) {
			console.log("- Error Producing Producer : ", error)
		}
	})

	socket.on("transport-connect", async ({ dtlsParameters, userId }) => {
		try {
			await mediasoupVariable.connectTransport({ dtlsParameters, userId })
			// getTransport({ socketId: socket.id, mediasoupParameter }) .connect({ dtlsParameters })
		} catch (error) {
			console.log("- Error Connecting Transport Connect : ", error)
		}
	})

	socket.on("consume", async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId, roomId, userId, producerPaused }, callback) => {
		try {
			// Be Careful of creating new router
			const router = await mediasoupVariable.getRouter({ roomId })

			// const consumertransport = await mediasoupVariable.getConsumerTransport({ consumerTransportId: serverConsumerTransportId })

			const producerData = await mediasoupVariable.getProducer({ remoteProducerId })
			if (
				router.canConsume({
					producerId: remoteProducerId,
					rtpCapabilities,
				})
			) {
				let appData = producerData.producer.appData
				const consumer = await mediasoupVariable.createConsumer({
					producerId: remoteProducerId,
					rtpCapabilities,
					appData,
					consumerTransportId: serverConsumerTransportId,
					userId,
					socket,
				})

				let user = await liveMeeting.findUser({ roomId: roomId, userId: userId })
				let params = {
					id: consumer.id,
					producerId: remoteProducerId,
					kind: consumer.kind,
					rtpParameters: consumer.rtpParameters,
					serverConsumerId: consumer.id,
					appData,
					username: user.username,
					userId: userId,
					authority: user.authority,
					producerPaused,
				}

				callback({ params })
			}
		} catch (error) {
			console.log("- Error Consuming : ", error)
		}
	})

	socket.on("producer-pause", async ({ socketId, producerId }, callback) => {
		try {
			const userProducer = mediasoupVariable.producers.find((p) => p.producer.id === producerId)
			if (!userProducer) {
				return callback({ status: false, message: "Producer not found" })
			}
			await userProducer.producer.pause()
			callback({ status: true, message: "Successfully paused producer" })
		} catch (error) {
			callback({ status: false, message: error.message })
		}
	})

	socket.on("producer-resume", async ({ socketId, producerId }, callback) => {
		try {
			const userProducer = mediasoupVariable.producers.find((p) => p.producer.id === producerId)
			if (!userProducer) {
				return callback({ status: false, message: "Producer not found" })
			}
			await userProducer.producer.resume()
			callback({ status: true, message: "Successfully resumed producer" })
		} catch (error) {
			callback({ status: false, message: error.message })
		}
	})

	socket.on("consumer-resume", async ({ serverConsumerId }, callback) => {
		try {
			const isResumed = await mediasoupVariable.resumeConsumer({ consumerId: serverConsumerId })

			if (isResumed) {
				callback({ status: true, message: "Successfully resumed consumer" })
			} else {
				callback({ status: true, message: "producer-paused" })
			}
		} catch (error) {
			console.log("- Error Resuming Consumer : ", error)
			callback({ status: false, message: error.message })
		}
	})

	socket.on("consumer-pause", async ({ serverConsumerId }, callback) => {
		try {
			await mediasoupVariable.pauseConsumer({ consumerId: serverConsumerId })
			callback({ status: true, message: "Successfully paused consumer" })
		} catch (error) {
			console.log("- Error Resuming Consumer : ", error)
			callback({ status: false, message: error.message })
		}
	})

	socket.on("get-producers", async ({ roomId, userId }, callback) => {
		try {
			const producerData = await mediasoupVariable.getProducers({ userId, roomId })
			let customIndex = 0
			const producerList = producerData.map((p) => {
				if (p.producer.appData.kind == "video") {
					customIndex++
					return {
						producerId: p.producer.id,
						userId: p.producer.appData.userId,
						socketId: p.producer.appData.socketId,
						kind: "video",
						indexing: customIndex,
						producerPaused: p.producer.paused,
					}
				} else {
					return {
						producerId: p.producer.id,
						userId: p.producer.appData.userId,
						socketId: p.producer.appData.socketId,
						kind: "audio",
						indexing: false,
						producerPaused: p.producer.paused,
					}
				}
			})

			callback({ producerList })
		} catch (error) {
			console.log("- Error Getting Producers : ", error)
		}
	})

	socket.on("transport-recv-connect", async ({ dtlsParameters, serverConsumerTransportId }) => {
		try {
			await mediasoupVariable.connectRecvTransport({ dtlsParameters, serverConsumerTransportId })
		} catch (error) {
			console.log("- Error Connecting Transport Receive : ", error)
		}
	})

	socket.on("stop-screensharing", async ({ producerId, label }) => {
		try {
			await mediasoupVariable.closeScreenSharing({ producerId })
			socket.emit("stop-screensharing", { producerId, label })
		} catch (error) {
			console.log("- Error Stop Screen Sharing Video : ", error)
		}
	})

	socket.on("screensharing-permission", async ({ socketId, userId, to, type, response, username }) => {
		try {
			socket.to(to).emit("screensharing-permission", { socketId, userId, to, type, response, username })
		} catch (error) {
			console.log("- Error Getting Screen Sharing Permission : ", error)
		}
	})

	socket.on("force-stop-screensharing", async ({ to }) => {
		try {
			socket.to(to).emit("force-stop-screensharing", { message: "Berbagi layar diberhentikan oleh admin" })
		} catch (error) {
			console.log("- Error Force Stop Screen Sharing : ", error)
		}
	})

	socket.on("admin-response", async ({ type, id, roomId }) => {
		try {
			liveMeeting.users.forEach((u) => {
				if ((u.authority == 1 || u.authority == 2) && u.roomId == roomId && u.socketId != socket.id) {
					socket.to(u.socketId).emit("admin-response", { type, id, roomId })
				}
			})
		} catch (error) {
			console.log("- Error Admin response : ", error)
		}
	})

	socket.on("hang-up", async ({ userId }, callback) => {
		try {
			userSession.token = null
			await Helpers.saveSession(userSession)
			callback({ status: true })
		} catch (error) {
			console.log("- Error Hanging Up Socket : ", error)
		}
	})

	socket.on("raise-hand", ({ to, userId, username, picture, status }) => {
		try {
			socket.to(to).emit("raise-hand", { userId, username, picture, status })
		} catch (error) {
			console.log("- Error Raise Hand Socket : ", error)
		}
	})

	socket.on("transcribe", ({ message, username, picture, to, randomId }) => {
		try {
			socket.to(to).emit("transcribe", { message, username, picture, randomId })
		} catch (error) {
			console.log("- Error Socket Transcribe : ", error)
		}
	})

	socket.on("mute-all", ({ to, status }) => {
		try {
			socket.to(to).emit("mute-all", { status })
		} catch (error) {
			console.log("- Error Socket Mute All : ", error)
		}
	})

	socket.on("lock-room", async ({ roomId, lock }, callback) => {
		try {
			await liveMeeting.changeMeetType({ roomId, meetingType: lock ? 1 : 2 })
			callback({ status: true })
		} catch (error) {
			console.lock("- Error Lock Room : ", error)
		}
	})

	socket.on("set-consumer-quality", async ({ consumerId, SL, TL }) => {
		try {
			mediasoupVariable.consumers.forEach((consumer) => {
				const { spatialLayer, temporalLayer } = consumer.consumer.currentLayers
				// console.log("- SL : ", spatialLayer, " - TL : ", temporalLayer, ` Change To : ${SL} ${TL}`)
				if (consumer.consumer.id == consumerId) {
					consumer.consumer.setPreferredLayers({ spatialLayer: SL, temporalLayer: TL })
				}
			})
		} catch (error) {
			console.log("- Error Set Consumer Quality : ", error)
		}
	})

	socket.on("kick-user", async ({ message, to }) => {
		try {
			socket.to(to).emit("kick-user", { message })
		} catch (error) {
			console.log("- Error Socket Kick User : ", error)
		}
	})
})

// for monitoring purpose

app.get(`${url}/rooms`, async (req, res, next) => {
	try {
		const rooms = await liveMeeting.getRooms()
		res.send({ rooms: rooms.rooms, total: rooms.totalRooms })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/users`, async (req, res, next) => {
	try {
		res.send({ users: liveMeeting.users, total: liveMeeting.users.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/waiting-list`, async (req, res, next) => {
	try {
		const waitingList = await liveMeeting.users.filter((u) => u.waiting)
		res.send({ waitingList: waitingList, total: waitingList.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/workers`, async (req, res, next) => {
	try {
		res.send({ workers: mediasoupVariable.workers, total: mediasoupVariable.workers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/routers`, async (req, res, next) => {
	try {
		res.send({ routers: mediasoupVariable.routers, total: mediasoupVariable.routers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/transports`, async (req, res, next) => {
	try {
		res.send({ transports: mediasoupVariable.transports, total: mediasoupVariable.transports.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/producers`, async (req, res, next) => {
	try {
		res.send({
			producers: mediasoupVariable.producers.map((p) => ({
				id: p.producer.id,
				kind: p.producer.kind,
				paused: p.producer.paused,
				appData: p.producer.appData,
			})),
			total: mediasoupVariable.producers.length,
		})
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/consumers`, async (req, res, next) => {
	try {
		res.send({
			consumers: mediasoupVariable.consumers.map((c) => ({
				id: c.consumer.id,
				kind: c.consumer.kind,
				paused: c.consumer.paused,
				appData: c.consumer.appData,
			})),
			total: mediasoupVariable.consumers.length,
		})
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get(`${url}/mediasoup/restart`, async (req, res, next) => {
	try {
		// console.log("- Users : ", liveMeeting.users)
		// console.log("- Mediasoup Worker : ", mediasoupVariable.workers)
		// console.log("- Mediasoup Router : ", mediasoupVariable.routers)
		// console.log("- Mediasoup Transports : ", mediasoupVariable.transports)
		// console.log("- Mediasoup Producer : ", mediasoupVariable.transports)
		// console.log("- Mediasoup Consumer : ", mediasoupVariable.consumers)

		await Promise.all(
			mediasoupVariable.consumers.map((c) => {
				c.consumer.close()
			})
		)
		mediasoupVariable.consumers = []

		await Promise.all(
			mediasoupVariable.producers.map((p) => {
				p.producer.close()
			})
		)

		mediasoupVariable.producers = []

		await Promise.all(
			mediasoupVariable.transports.map((t) => {
				t.transport.close()
			})
		)
		mediasoupVariable.transports = []

		await Promise.all(
			mediasoupVariable.routers.map((r) => {
				r.router.close()
			})
		)
		mediasoupVariable.routers = []

		await Promise.all(
			mediasoupVariable.workers.map((w) => {
				w.webrtcServer.close()
				w.worker.close()
			})
		)
		mediasoupVariable.workers = []

		liveMeeting.users = []

		res.send({ message: "Successfully reset the worker" })
	} catch (error) {
		console.log("- Error : ", error)
		res.send({ message: "Error reset the worker " })
	}
})

app.use(url, router)
app.use(Middlewares.errorHandler)
