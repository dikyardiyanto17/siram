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
const port = 80
// const port = 9188
const { options } = require("./certif")
const http = require("http")
const path = require("path")
const https = require("httpolyglot")
const { Server } = require("socket.io")
const { Rooms } = require("./server_parameter/rooms.js")
const { Users } = require("./server_parameter/users.js")
const { MediaSoup } = require("./server_parameter/mediasoup.js")
const errorHandler = require("./middlewares/errorHandler.js")
const ControllerRoom = require("./controllers/room.js")
const { decodeToken } = require("./helper/jwt.js")
const { LiveMeeting } = require("./server_parameter/live_meeting.js")
const { saveSession } = require("./helper/index.js")
const RoomSiram = require("./controllers/room_siram.js")

app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(express.json({ limit: "50mb" }))

app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "public")))

const sessionMiddleware = session({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: true,
		sameSite: true,
	},
})

app.set("trust proxy", 1)

app.use(sessionMiddleware)

let mediasoupVariable = new MediaSoup()
let roomsVariable = new Rooms()
let usersVariable = new Users()
let liveMeeting = new LiveMeeting()

const httpsServer = https.createServer(options, app)
httpsServer.listen(port, async () => {
	console.log("App On : " + port)
})
const io = new Server(httpsServer, {
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

	socket.on("joining-room", async ({ roomId, position, password }, callback) => {
		try {
			// If Room ID is false
			if (!roomId || roomId.trim() == "") {
				callback({ status: false, roomName: null, meetingDate: null })
				throw { name: "Invalid", message: "Invalid room!" }
			}

			// If the position is in home and its doesnot send password
			if (position == "home" && (!password || password.trim() == "")) {
				throw { name: "Invalid", message: "Invalid room!" }
			}

			// If the position is in room and they havenot enter the room from lobby or home
			if (position == "room" && (!userSession.password || userSession.password.trim() == "")) {
				callback({ status: false, roomName: null, meetingDate: null })
				throw { name: "Invalid", message: "Invalid room!" }
			}

			const decodedToken = await decodeToken(userSession.token)
			const { participant_id, full_name } = decodedToken

			// If token is invalid
			if (!decodedToken) {
				throw { name: "Invalid", message: "User tidak valid!" }
			}

			// Check if room is exist or not
			const meetingRoom = await ControllerRoom.joinRoom({
				room_id: roomId,
				participant_id,
				password: position == "room" ? userSession.password : password,
			})

			if (!meetingRoom) {
				callback({ status: false, roomName: null, meetingDate: null })
				throw { name: "Invalid", message: "Invalid room!" }
			}

			// Create worker if its doesnot exist
			if (mediasoupVariable.workers.length == 0) {
				await mediasoupVariable.createWorker()
			}

			const { user, room } = meetingRoom

			const { meeting_type } = room

			if (!userSession.roomId || userSession.roomId.trim() == "" || !userSession.password || userSession.password.trim() == "") {
				userSession.roomId = roomId
				userSession.roomName = room.room_name
				userSession.password = password
				userSession.meetingType = meeting_type
				userSession.faceRecognition = room.face_recognition
				await saveSession(userSession)
			}

			// Add User data to node.js server for the 1st time enter the room
			if (position == "home" || position == "lobby") {
				if ((meeting_type == 1 && position == "home") || (meeting_type == 2 && position == "lobby")) {
					callback({ status: false, roomName: room.room_name, meetingDate: room.start_date, meeting_type })
					return
				}

				await liveMeeting.addUser({
					participantId: user.participant_id,
					roomId: room.room_id,
					socketId: socket.id,
					authority: user.authority,
					verified: false,
					joined: false,
					waiting: true,
					username: user.full_name,
					picture: user.photo_path,
				})

				// Check user authority
				// If user is admin (1 or 2), it will auto enter the room without waiting, otherwise wait in home or lobby
				if (user.authority == 1 || user.authority == 2) {
					// Change status USER to verified is true and and not waiting (false)
					await liveMeeting.changeVerifiedList({ participantId: user.participant_id, roomId: room.room_id, status: true })
					await liveMeeting.changeWaitingList({ participantId: user.participant_id, status: false, roomId: room.room_id })

					// Send signal to user if the permit is granted
					callback({ status: true, roomName: room.room_name, meetingDate: room.start_date, meeting_type })
				} else if (user.authority == 3) {
					// Normal user
					// Check if user already did joined the room
					const checkUserDidJoined = await liveMeeting.findUser({ roomId: roomId, userId: user.participant_id })
					const { verified } = checkUserDidJoined

					// if user did already joined the room, its doesnot need permission anymore, otherwise its waiting in the room
					if (verified) {
						callback({ status: true, roomName: room.room_name, meetingDate: room.start_date, meeting_type })
					} else {
						// find admin to send signal if USER is waiting in the room and waiting for admin permission
						const admins = await liveMeeting.findAdmin({ roomId: room.room_id })
						admins.forEach((u) => {
							socket
								.to(u.socketId)
								.emit("member-joining-room", { id: user.participant_id, socketId: socket.id, username: user.full_name, picture: user.photo_path })
						})
						callback({ status: false, roomName: room.room_name, meetingDate: room.start_date, meeting_type, picture: user.photo_path })
					}
				} else {
					throw { name: "Invalid", message: "User tidak valid!" }
				}
			} else if (position == "room") {
				// User joining in the ROOM page

				// Check if user is saved or not in not js variabel
				const checkUser = await liveMeeting.checkUser({ participantId: user.participant_id, roomId: room.room_id })
				if (!checkUser) {
					callback({ status: false, roomName: room.room_name, meetingDate: room.start_date, meeting_type })
					return
				}

				// Change the deleted proccess user in case user is not log out because its over, but network
				await liveMeeting.changeProcessDeleteUserList({ participantId: user.participant_id, roomId, status: false })

				// Change USER joined status and update socket id
				await liveMeeting.changeJoinedList({ participantId: user.participant_id, roomId: room.room_id, status: true, socketId: socket.id })

				// Get routers
				const router = await mediasoupVariable.getRouter({ roomId: roomId })
				const rtpCapabilities = router.rtpCapabilities

				// If USER is admin, get the waiting list
				if (user.authority == 1 || user.authority == 2) {
					const waitingList = await liveMeeting.getWaitingList({ roomId })
					callback({
						status: true,
						roomId,
						userId: user.participant_id,
						authority: user.authority,
						rtpCapabilities,
						waitingList,
						username: user.full_name,
						meeting_type,
					})
					return
				}

				callback({
					status: true,
					roomId,
					userId: user.participant_id,
					authority: user.authority,
					rtpCapabilities,
					username: user.full_name,
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

			socket.to(user.socketId).emit("response-member-waiting", { response, roomId: userSession.roomName.replace(/\s+/g, "-"), id })

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

	socket.on("screensharing-permission", async ({ socketId, userId, to, type, response }) => {
		try {
			socket.to(to).emit("screensharing-permission", { socketId, userId, to, type, response })
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

	socket.on("check-room", async ({ roomId }, callback) => {
		try {
			const room = await RoomSiram.find({ roomId })
			if (!room) {
				console.log("Room Tidak Ditemukan")
				callback({ response: 2, roomId })
			}
			callback({ response: 1, roomId })
			console.log("- Room : ", room)
		} catch (error) {
			console.log("- Error Check Room : ", error)
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
