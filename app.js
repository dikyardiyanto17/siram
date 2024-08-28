const express = require("express")
const cors = require("cors")
const router = require("./routes/index.js")
const app = express()
const port = 9188
// const port = 9188
const { options } = require("./certif")
const http = require("http")
const path = require("path")
const https = require("httpolyglot")
const { Server } = require("socket.io")
const { Rooms } = require("./server_parameter/rooms.js")
const { Users } = require("./server_parameter/users.js")
const { MediaSoup } = require("./server_parameter/mediasoup.js")

app.use(cors())
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "views")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "public")))

let mediasoupVariable = new MediaSoup()
let roomsVariable = new Rooms()
let usersVariable = new Users()

const httpsServer = https.createServer(options, app)
httpsServer.listen(port, async () => {
	console.log("App On : " + port)
})
const io = new Server(httpsServer, {
	path: "/socket",
})

io.on("connection", async (socket) => {
	socket.on("disconnect", async () => {
		try {
			console.log("- Disconnected : ", socket.id)
			const waitingUser = await roomsVariable.findWaitingUser({ socketId: socket.id })
			if (waitingUser) {
				const admin = await roomsVariable.findRoomAdmin({ roomId: waitingUser.roomId })
				const adminSocket = await usersVariable.findRoomAdmin({ userId: admin.id })
				await socket.to(adminSocket.socketId).emit("cancel-waiting", { socketId: socket.id, userId: waitingUser.userId })
				await roomsVariable.deleteWaitingList({ socketId: socket.id })
			}
			// Check if its added in CLASS_USER
			const user = await usersVariable.findUserBySocket({ userSocketId: socket.id })

			if (!user) {
				throw { name: "Not Found", message: "User is Not Found" }
			}

			await mediasoupVariable.deleteAndCloseUser({ userId: user.id })

			usersVariable.users.forEach((u) => {
				if (u.id != user.id && u.roomId == user.roomId) {
					socket.to(u.socketId).emit("user-logout", { userId: user.id })
				}
			})

			await usersVariable.deleteUser({ userId: user.id })
			await roomsVariable.deleteUserInTheRoom({ userId: user.id })
			console.log("- Deleting : ", user.id)
		} catch (error) {
			console.log("- Error Disconnecting Socket : ", error)
		}
	})

	socket.on("joining-room", async ({ roomId, userId, position }, callback) => {
		try {
			if (mediasoupVariable.workers.length == 0) {
				await mediasoupVariable.createWorker()
			}
			// Check the page of the user
			if (position == "home") {
				// Check if there is someone in the room
				const feedback = await roomsVariable.findRoom({ roomId, userId, socketId: socket.id })
				// If there is, wait for permission and Add it to CLASS_ROOM WaitingList
				if (feedback.status) {
					// Find admin by user ID
					const adminData = await usersVariable.findRoomAdmin({ userId: feedback.adminId })
					if (!adminData) {
						throw { name: "Invalid", message: "Admin is not exist" }
					}
					socket.to(adminData.socketId).emit("member-joining-room", { id: userId, socketId: socket.id })
				}
				callback(feedback)
			} else if (position == "room") {
				// Check if user is confirmed exist
				const feedback = await roomsVariable.findRoomUser({ roomId, userId })
				// If exist go to room
				if (feedback) {
					// Check if user is admin or not
					let user = await roomsVariable.findUser({ roomId: roomId, userId: userId })
					// Add user to CLASS_USER
					usersVariable.addUser({ userId, socketId: socket.id, roomId, admin: user.admin })

					// Get routers
					const router = await mediasoupVariable.getRouter({ roomId: roomId })
					const rtpCapabilities = router.rtpCapabilities

					callback({ status: true, roomId, userId, isAdmin: user.admin, rtpCapabilities })
				} else {
					// If its not exist back to lobby
					callback({ status: false, roomId, userId })
				}
			} else {
				throw { name: "Invalid", message: "Invalid Login" }
			}
		} catch (error) {
			console.log("- Error Joining Room : ", error)
		}
	})

	socket.on("response-member-waiting", async ({ response, id, roomId }) => {
		try {
			const user = await roomsVariable.findSocketInWaitingList({ userId: id })
			if (!user) {
				throw { name: "Not Found", message: "Room is not found" }
			}

			await roomsVariable.deleteWaitingList({ socketId: user.socketId })

			if (response) {
				await roomsVariable.addRoomMember({ userId: id, roomId: roomId })
			}

			socket.to(user.socketId).emit("response-member-waiting", { response, roomId })
		} catch (error) {
			console.log("- Error Response Member Waiting : ", error)
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

	socket.on("message", ({ userId, to, message }) => {
		try {
			console.log(userId, message, to)
			socket.to(to).emit("message", { userId, message })
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

			await usersVariable.informUser({ roomId, producerId: producer.id, socket, userId })

			const isUserExist = await usersVariable.checkTheRoom({ roomId, userId })

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

				let user = await roomsVariable.findUser({ roomId: roomId, userId: userId })
				let params = {
					id: consumer.id,
					producerId: remoteProducerId,
					kind: consumer.kind,
					rtpParameters: consumer.rtpParameters,
					serverConsumerId: consumer.id,
					appData,
					username: userId,
					userId: userId,
					admin: user.admin,
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

			// const consumerTransport = mediasoupParameter.transports.find(
			// 	(transportData) => transportData.consumer && transportData.transport.id == serverConsumerTransportId
			// ).transport
			// consumerTransport.connect({ dtlsParameters }).catch((error) => {
			// 	console.log("- Error Connecting Receiver Transport : ", error)
			// })
		} catch (error) {
			console.log("- Error Connecting Transport Receive : ", error)
		}
	})
})

app.get("/rooms", async (req, res, next) => {
	try {
		res.send({ rooms: roomsVariable.rooms, total: roomsVariable.rooms.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/users", async (req, res, next) => {
	try {
		res.send({ users: usersVariable.users, total: usersVariable.users.length })
	} catch (error) {
		console.log("- Error get Room")
	}
})

app.get("/waiting-list", async (req, res, next) => {
	try {
		res.send({ waitingList: roomsVariable.waitingList, total: roomsVariable.waitingList.length })
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
