require("dotenv").config()

const ejs = require("ejs")
ejs.delimiter = "/"
ejs.openDelimiter = "["
ejs.closeDelimiter = "]"

const express = require("express")
const cors = require("cors")
const session = require("express-session")
const router = require("./routes/index.js")
const app = express()
const port = 9100
const { options } = require("./certif")
const http = require("http")
const path = require("path")
const https = require("httpolyglot")
const { Server } = require("socket.io")
const { MediaSoup } = require("./server_parameter/mediasoup.js")
const errorHandler = require("./middlewares/errorHandler.js")
const { decodeToken } = require("./helper/jwt.js")
const { LiveMeeting } = require("./server_parameter/live_meeting.js")
const { saveSession } = require("./helper/index.js")

app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(express.json({ limit: "50mb" }))

app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "public")))

const sessionMiddleware = session({
	secret: process.env.EXPRESS_SESSION_SECRET || "ISULOSTNEMUCODSDRTPSESSION",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: true,
		// secure: false,
		sameSite: true,
	},
})

app.set("trust proxy", 1)

app.use(sessionMiddleware)

let mediasoupVariable = new MediaSoup()
let liveMeeting = new LiveMeeting()
if (mediasoupVariable.workers.length == 0) {
	mediasoupVariable.createWorker()
}

// const httpsServer = https.createServer(options, app)
// httpsServer.listen(port, async () => {
// 	console.log("App On : " + port)
// })
// const io = new Server(httpsServer, {
// 	path: "/socket",
// })

const httpServer = http.createServer(app)
httpServer.listen(port, async () => {
	console.log("App On : " + port)
})
const io = new Server(httpServer, {
	path: "/socket",
})

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res || {}, next)
})

io.on("connection", async (socket) => {
	const userSession = socket.request.session

	socket.on("disconnect", async () => {
		try {
			const user = await liveMeeting.findUserBySocket({ socketId: socket.id })
			if (user) {
				await mediasoupVariable.deleteAndCloseUser({ userId: user.participantId })
				await liveMeeting.deleteUser({ socket, userSession })
			}

			console.log("- Deleted User : ", user)
		} catch (error) {
			console.log("- Error Disconnecting Socket : ", error)
		}
	})

	socket.on("joining-room", async ({ position, token }, callback) => {
		try {
			const decodedRoom = await decodeToken(token)
			const decodedUser = await decodeToken(userSession.token)
			if (!decodedRoom || !decodedUser) {
				callback({ status: false, message: "Invalid Token" })
				throw { name: "Invalid", message: "Invalid Token" }
			}
			const { participant_id, full_name, user_id, role, exception, status, photo, photo_path, nik, nrp, authority } = decodedUser.user
			const {
				id,
				no_perkara,
				meeting_type,
				room_id,
				face_recognition,
				password,
				room_name,
				reference_room_id,
				max_participants,
				start_date,
				end_date,
				status: roomStatus,
				note,
				last_updated_at,
				deleted_at,
				created_by,
				created_at,
				updated_at,
			} = decodedRoom

			if (position == "room" && !userSession.roomToken) {
				callback({ status: false, message: "Invalid Token" })
				throw { name: "Invalid", message: "Invalid Token" }
			}

			if (position == "home") {
				userSession.meeting = {
					firstTimeJoin: true,
					waiting: true,
					verified: false,
					authority: authority,
					meetingType: meeting_type,
					roomId: room_id,
					password: password,
					faceRecognition: face_recognition,
					userId: user_id,
					participantId: participant_id,
					photoPath: photo_path,
					role: role,
					nik: nik,
					nrp: role,
					roomName: room_name,
					startDate: start_date,
				}
				userSession.roomToken = token
				await saveSession(userSession)
			}

			// Create worker if its doesnot exist
			if (mediasoupVariable.workers.length == 0) {
				await mediasoupVariable.createWorker()
			}

			// Add User data to node.js server for the 1st time enter the room
			if (position == "home" || position == "lobby") {
				if ((meeting_type == 1 && position == "home") || (meeting_type == 2 && position == "lobby")) {
					callback({ status: false, roomName: room_name, meetingDate: start_date, meeting_type })
					return
				}

				await liveMeeting.addUser({
					participantId: participant_id,
					roomId: room_id,
					socketId: socket.id,
					authority: authority,
					verified: false,
					joined: false,
					waiting: true,
					username: full_name,
					picture: photo_path,
				})

				// Check user authority
				// If user is admin (1 or 2), it will auto enter the room without waiting, otherwise wait in home or lobby
				if (authority == 1 || authority == 2) {
					// Change status USER to verified is true and and not waiting (false)
					await liveMeeting.changeVerifiedList({ participantId: participant_id, roomId: room_id, status: true })
					await liveMeeting.changeWaitingList({ participantId: participant_id, status: false, roomId: room_id })

					console.log(room_name, meeting_type, start_date, meeting_type)
					// Send signal to user if the permit is granted
					callback({ status: true, roomName: room_name, meetingDate: start_date, meeting_type })
				} else if (authority == 3) {
					// Normal user
					// Check if user already did joined the room
					const checkUserDidJoined = await liveMeeting.findUser({ roomId: room_id, userId: participant_id })
					const { verified } = checkUserDidJoined

					// if user did already joined the room, its doesnot need permission anymore, otherwise its waiting in the room
					if (verified) {
						callback({ status: true, roomName: room_name, meetingDate: start_date, meeting_type })
					} else {
						// find admin to send signal if USER is waiting in the room and waiting for admin permission
						const admins = await liveMeeting.findAdmin({ roomId: room_id })
						admins.forEach((u) => {
							socket.to(u.socketId).emit("member-joining-room", { id: participant_id, socketId: socket.id, username: full_name, picture: photo_path })
						})
						callback({ status: false, roomName: room_name, meetingDate: start_date, meeting_type, picture: photo_path })
					}
				} else {
					throw { name: "Invalid", message: "User tidak valid!" }
				}
			} else if (position == "room") {
				// User joining in the ROOM page

				// Check if user is saved or not in not js variabel
				const checkUser = await liveMeeting.checkUser({ participantId: participant_id, roomId: room_id })
				if (!checkUser) {
					callback({ status: false, roomName: room_name, meetingDate: start_date, meeting_type })
					return
				}

				// Change the deleted proccess user in case user is not log out because its over, but network
				await liveMeeting.changeProcessDeleteUserList({ participantId: participant_id, roomId: room_id, status: false })

				// Change USER joined status and update socket id
				await liveMeeting.changeJoinedList({ participantId: participant_id, roomId: room_id, status: true, socketId: socket.id })

				// Get routers
				const router = await mediasoupVariable.getRouter({ roomId: room_id })
				const rtpCapabilities = router.rtpCapabilities

				// If USER is admin, get the waiting list
				if (authority == 1 || authority == 2) {
					const waitingList = await liveMeeting.getWaitingList({ roomId: room_id })
					callback({
						status: true,
						roomId: room_id,
						userId: participant_id,
						authority: authority,
						rtpCapabilities,
						waitingList,
						username: full_name,
						meeting_type,
					})
					return
				}

				callback({
					status: true,
					roomId: room_id,
					userId: participant_id,
					authority: authority,
					rtpCapabilities,
					username: full_name,
					meeting_type,
				})
			} else {
				throw { name: "Invalid", message: "User tidak valid!" }
			}
		} catch (error) {
			console.log("- Error Joining Room : ", error)
		}
	})

	socket.on("response-member-waiting", async ({ response, id, roomId }) => {
		try {
			const user = await liveMeeting.findUser({ roomId, userId: id })
			if (!user) {
				throw { name: "Not Found", message: "Room is not found" }
			}

			await liveMeeting.changeVerifiedList({ participantId: id, roomId: roomId, status: response })
			await liveMeeting.changeWaitingList({ participantId: id, status: response ? false : true, roomId: roomId })

			socket.to(user.socketId).emit("response-member-waiting", { response, roomId: userSession.meeting.roomName.replace(/\s+/g, "-"), id })

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
			await saveSession(userSession)
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

	socket.on("message", ({ userId, to, message, username, picture }) => {
		try {
			socket.to(to).emit("message", { userId, message, username, picture })
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

			await liveMeeting.informUser({ roomId, producerId: producer.id, socket, userId })
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

	socket.on("consume", async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId, roomId, userId }, callback) => {
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
				}

				callback({ params })
			}
		} catch (error) {
			console.log("- Error Consuming : ", error)
		}
	})

	socket.on("consumer-resume", async ({ serverConsumerId }) => {
		try {
			await mediasoupVariable.resumeConsumer({ consumerId: serverConsumerId })
		} catch (error) {
			console.log("- Error Resuming Consumer : ", error)
		}
	})

	socket.on("consumer-pause", async ({ serverConsumerId }) => {
		try {
			await mediasoupVariable.pauseConsumer({ consumerId: serverConsumerId })
		} catch (error) {
			console.log("- Error Resuming Consumer : ", error)
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
					}
				} else {
					return {
						producerId: p.producer.id,
						userId: p.producer.appData.userId,
						socketId: p.producer.appData.socketId,
						kind: "audio",
						indexing: false,
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
			await saveSession(userSession)
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

	socket.on("set-consumer-quality", async ({ consumerId, SL, TL }) => {
		try {
			mediasoupVariable.consumers.forEach((consumer) => {
				if (consumer.consumer.id == consumerId) {
					const { spatialLayer, temporalLayer } = consumer.consumer.currentLayers
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

app.get("/rooms", async (req, res, next) => {
	try {
		const { roomId } = req.session
		const rooms = await liveMeeting.users.filter((u) => u.roomId == roomId)
		res.send({ rooms: rooms, total: rooms.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/users", async (req, res, next) => {
	try {
		res.send({ users: liveMeeting.users, total: liveMeeting.users.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/waiting-list", async (req, res, next) => {
	try {
		const waitingList = await liveMeeting.users.filter((u) => u.waiting)
		res.send({ waitingList: waitingList, total: waitingList.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/mediasoup/workers", async (req, res, next) => {
	try {
		res.send({ workers: mediasoupVariable.workers, total: mediasoupVariable.workers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/mediasoup/routers", async (req, res, next) => {
	try {
		res.send({ routers: mediasoupVariable.routers, total: mediasoupVariable.routers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/mediasoup/transports", async (req, res, next) => {
	try {
		res.send({ transports: mediasoupVariable.transports, total: mediasoupVariable.transports.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/mediasoup/producers", async (req, res, next) => {
	try {
		res.send({ producers: mediasoupVariable.producers, total: mediasoupVariable.producers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/mediasoup/consumers", async (req, res, next) => {
	try {
		res.send({ consumers: mediasoupVariable.consumers, total: mediasoupVariable.consumers.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.use(router)

app.use(errorHandler)
