const mediasoup = require("mediasoup")

class MediaSoup {
	#privateIp = "0.0.0.0"
	// #publicIp = "192.168.81.3" // Hotspot
	// #publicIp = "203.175.10.29" // VPS
	#publicIp = "203.194.113.166" // VPS	2 Core Pak Indra
	// #publicIp = "192.168.20.177" // KOS
	// #publicIp = "192.168.205.229" // RDS co.id
	// #publicIp = "203.175.10.29"
	// #publicIp = "192.168.18.68" // RDS 5g
	#mediaCodecs = [
		{
			kind: "audio",
			mimeType: "audio/opus",
			clockRate: 48000,
			channels: 2,
		},
		{
			kind: "video",
			mimeType: "video/VP8",
			clockRate: 90000,
			parameters: {
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/VP9",
			clockRate: 90000,
			parameters: {
				"profile-id": 2,
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "4d0032",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 1000,
			},
		},
		{
			kind: "video",
			mimeType: "video/h264",
			clockRate: 90000,
			parameters: {
				"packetization-mode": 1,
				"profile-level-id": "42e01f",
				"level-asymmetry-allowed": 1,
				"x-google-start-bitrate": 1000,
			},
		},
	]

	#workers = []
	#routers = []
	#transports = []
	#producers = []
	#consumers = []

	#listenInfo

	constructor() {
		this.#listenInfo = {
			listenInfos: [
				{
					protocol: "udp",
					ip: this.#privateIp,
					announcedIp: this.#publicIp,
				},
				{
					protocol: "tcp",
					ip: this.#privateIp,
					announcedIp: this.#publicIp,
				},
			],
		}
	}

	get workers() {
		return this.#workers
	}

	get routers() {
		return this.#routers
	}

	get transports() {
		return this.#transports
	}

	get producers() {
		return this.#producers
	}

	get consumers() {
		return this.#consumers
	}

	async createWorker() {
		try {
			const worker = await mediasoup.createWorker()
			worker.on("died", (error) => {
				console.error("mediasoup worker died!: %o", error)
			})

			worker.on("subprocessclose", () => {
				console.log("Worker (subprocessclose) Completely Shut Down!")
			})

			worker.observer.on("close", () => {
				try {
					console.log("Worker (close) is Closed => ", worker.pid)
				} catch (error) {
					console.log("- Error Worker Close Observer ", error)
				}
			})

			worker.observer.on("newrouter", (router) => {
				try {
					console.log("Worker (newrouter) => ", router.id)
					this.#routers.push({ router, workerPid: worker.pid })
				} catch (error) {
					console.log("- Error New Router Observer : ", error)
				}
			})

			worker.observer.on("newwebrtcserver", (webRtcServer) => {
				try {
					console.log("Worker (newwebrtcserver) => ", webRtcServer.id)
				} catch (error) {
					console.log("- Error Worker newwebrtcserver : ", error)
				}
			})

			const webrtcServer = await worker.createWebRtcServer(this.#listenInfo)
			this.#workers.push({ worker, webrtcServer })
		} catch (error) {
			console.log("- Error Create Worker : ", error)
		}
	}

	async getRouter({ roomId }) {
		try {
			const router = this.#routers.find((r) => r.router.appData.roomId == roomId)
			if (!router) {
				const worker = this.#workers[0]
				const newRouter = await worker.worker.createRouter({ mediaCodecs: this.#mediaCodecs, appData: { roomId } })
				newRouter.on("workerclose", () => {
					try {
						console.log("ROUTER (workerclose): Worker is closed")
					} catch (error) {
						console.log("- Error Router workerclose : ", error)
					}
				})

				// Handling If Router is Closed
				newRouter.observer.on("close", () => {
					try {
						console.log("Router (close) => ", newRouter.id)
						this.#transports = this.#transports.filter((t) => {
							if (t.routerId == newRouter.id) {
								t.transport.close()
								return null
							} else {
								return t
							}
						})
						this.#routers = this.#routers.filter((r) => r.router.id != newRouter.id)
					} catch (error) {
						console.log("- Error Router close : ", error)
					}
				})

				newRouter.observer.on("newtransport", (transport) => {
					try {
						console.log("ROUTER (newtransport) => ", transport.id)
						transport.setMaxIncomingBitrate(1500000)
						transport.setMaxOutgoingBitrate(1500000)
						this.#transports.push({ transport, routerId: newRouter.id })
					} catch (error) {
						console.log("- Error Router newtransport : ", error)
					}
				})
				return newRouter
			}

			return router.router
		} catch (error) {
			console.log("- Error Get Router : ", error)
		}
	}

	async createWebRTCTransport({ roomId, userId, consumer, socketId }) {
		try {
			const router = this.#routers.find((r) => r.router.appData.roomId == roomId)
			const worker = this.#workers.find((w) => w.worker.pid == router.workerPid)
			let configuration = {
				webRtcServer: worker.webrtcServer,
				enableUdp: true,
				enableTcp: true,
				preferUdp: true,
				appData: {
					userId,
					roomId,
					consumer,
					socketId,
				},
			}

			let transport = await router.router.createWebRtcTransport(configuration)

			transport.on("dtlsstatechange", (dtlsState) => {
				try {
					console.log(`DLTS State ${transport.id} On : `, dtlsState)
					if (dtlsState === "closed") {
						transport.close()
					}
				} catch (error) {
					console.log(`- Error DLTS Change ${transport.id} : `, error)
				}
			})

			// Transport Event
			transport.on("icestatechange", (iceState) => {
				console.log(`ICE state ${transport.id} changed to %s`, iceState)
			})

			transport.on("iceselectedtuplechange", (iceSelectedTuple) => {
				try {
					console.log(`Ice Selected Tuple ${transport.id} : `, iceSelectedTuple)
				} catch (error) {
					console.log(`- Ice Selected Tuple Change ${transport.id} : `, error)
				}
			})

			transport.on("sctpstatechange", (sctpState) => {
				try {
					console.log(`SCTP ${transport.id} State Change ${sctpState}`)
				} catch (error) {
					console.log(`- Error SCTP State Change ${transport.id} : `, error)
				}
			})

			// WEBRTC Transport Event
			transport.on("routerclose", () => {
				try {
					console.log("Transport (routerclose) => ", transport.id)
					this.#transports = this.#transports.filter((t) => {
						if (t.routerId == router.router.id) {
							t.transport.close()
							return null
						} else {
							return t
						}
					})
				} catch (error) {
					console.log(`- Error Transport (RouterClose) ${transport.id} : `, error)
				}
			})

			transport.on("listenserverclose", () => {
				try {
					console.log("Transport (listenserverclose) => ", transport.id)
				} catch (error) {
					console.log(`- Error Transport (ListenServerClose) ${transport.id}: `, error)
				}
			})

			transport.on("trace", (trace) => {
				try {
					console.log(`Transport (listenserverclose) ${transport.id} => `, trace)
				} catch (error) {
					console.log(`- Error Transport (trace) ${transport.id} : `, error)
				}
			})

			// Handling Transport Close
			transport.observer.on("close", () => {
				try {
					console.log(`Transport Observer (close) ${transport.id}`)
					this.#transports = this.#transports.filter((t) => t.transport.id != transport.id)
					const checkRoom = this.#transports.findIndex((t) => t.transport.appData.roomId == transport.appData.roomId)
					if (checkRoom == -1) {
						router.router.close()
					}
				} catch (error) {
					console.log(`- Error Transport Observer (close) ${transport.id} : `, error)
				}
			})

			transport.observer.on("newproducer", (producer) => {
				try {
					this.#producers.push({ producer })
					console.log(`Transport Observer (newproducer) ${transport.id} => `, producer.id)
				} catch (error) {
					console.log(`- Error Transport Observer (newproducer) ${transport.id} : `, error)
				}
			})

			transport.observer.on("newconsumer", (consumer) => {
				try {
					this.#consumers.push({ consumer })
					console.log(`Transport Observer (newconsumer) ${transport.id} => `, consumer.id)
				} catch (error) {
					console.log(`- Error Transport Observer (newconsumer) ${transport.id} : `, error)
				}
			})

			transport.observer.on("trace", (trace) => {
				try {
					console.log(`Transport Observer (trace) ${transport.id} => `, trace)
				} catch (error) {
					console.log(`- Error Transport Observer (trace) ${transport.id} : `, error)
				}
			})

			return { transport, routerId: router.router.id }
		} catch (error) {
			console.log(`- Error Create WebRTC Transport ${transport.id} : `, error)
		}
	}

	async createProducer({ userId, kind, rtpParameters, appData, roomId, socketId }) {
		try {
			const transport = this.#transports.find((t) => t.transport.appData.userId == userId && !t.transport.appData.consumer)
			if (transport) {
				const producer = await transport.transport.produce({
					kind,
					rtpParameters,
					appData: { ...appData, userId, kind, roomId, socketId: socketId },
					keyFrameRequestDelay: 1000,
				})

				// Producer Event
				producer.on("transportclose", () => {
					try {
						console.log(`Producer (transportclose) ${transport.transport.id} => `, producer.id)
						producer.close()
						this.#producers = this.#producers.filter((p) => p.producer.id != producer.id)
					} catch (error) {
						console.log("- Error Producer (transportclose) : ", error)
					}
				})

				producer.on("score", (score) => {
					try {
						console.log(`Producer (score) ${transport.transport.id} => ${producer.id} =>`, score)
					} catch (error) {
						console.log("- Error Producer (score) : ", error)
					}
				})

				producer.on("videoorientationchange", (videoOrientation) => {
					try {
						console.log(`Producer (videoorientationchange) ${transport.transport.id} => ${producer.id} =>`, videoOrientation)
					} catch (error) {
						console.log("- Error Producer (videoorientationchange) : ", error)
					}
				})

				producer.on("trace", (trace) => {
					try {
						console.log(`Producer (trace) ${transport.transport.id} => ${producer.id} =>`, trace)
					} catch (error) {
						console.log("- Error Producer (trace) : ", error)
					}
				})

				// Producer Observer Event
				producer.observer.on("close", () => {
					try {
						console.log(`Producer Observer (close) ${transport.transport.id} => ${producer.id}`)
						this.#producers = this.#producers.filter((p) => p.producer.id != producer.id)
					} catch (error) {
						console.log("- Error Producer Observer (close) : ", error)
					}
				})

				producer.observer.on("pause", () => {
					try {
						console.log(`Producer Observer (pause) ${transport.transport.id} => ${producer.id}`)
					} catch (error) {
						console.log("- Error Producer Observer (pause) : ", error)
					}
				})

				producer.observer.on("resume", () => {
					try {
						console.log(`Producer Observer (resume) ${transport.transport.id} => ${producer.id}`)
					} catch (error) {
						console.log("- Error Producer Observer (resume) : ", error)
					}
				})
				return producer
			}
		} catch (error) {
			console.log("- Error Create Producer : ", error)
		}
	}

	async connectTransport({ userId, dtlsParameters }) {
		try {
			const transport = this.#transports.find((t) => t.transport.appData.userId == userId && !t.transport.appData.consumer)
			if (transport) {
				await transport.transport.connect({ dtlsParameters })
			}
		} catch (error) {
			console.log("- Error Connect Transport : ", error)
		}
	}

	async deleteAndCloseUser({ userId }) {
		try {
			this.#transports.forEach((t) => {
				if (t.transport.appData.userId == userId) {
					t.transport.close()
				}
			})
		} catch (error) {
			console.log("- Error Delete And CLose User : ", error)
		}
	}

	async getConsumerTransport({ consumerTransportId }) {
		try {
			const transport = this.#transports.find((t) => t.transport.id == consumerTransportId && t.transport.appData.consumer)
			return transport.transport
		} catch (error) {
			console.log("- Error Get Consumer Transport : ", error)
		}
	}

	async getProducer({ remoteProducerId }) {
		try {
			const producerData = this.#producers.find((p) => p.producer.id == remoteProducerId)
			return producerData
		} catch (error) {
			console.log("- Error Get Producer : ", error)
		}
	}

	async getProducers({ userId, roomId }) {
		try {
			const producerList = this.#producers.filter((p) => {
				if (p.producer.appData.roomId == roomId && p.producer.appData.userId != userId) {
					return p.producer.id
				}
			})
			return producerList
		} catch (error) {
			console.log("- Error Get Producers : ", error)
		}
	}

	async createConsumer({ producerId, rtpCapabilities, appData, consumerTransportId, userId, socket }) {
		try {
			const consumerTransport = await this.getConsumerTransport({ consumerTransportId })
			const consumer = await consumerTransport.consume({
				producerId,
				rtpCapabilities,
				paused: true,
				appData: { ...appData, userId },
			})

			consumer.on("transportclose", () => {
				try {
					console.log(`Consumer (transportclose) ${consumerTransport.id} => ${consumer.id}`)
					socket.emit("close-consumer", { consumerId: consumer.id })
					consumer.close()
					this.#consumers = this.#consumers.filter((c) => c.consumer.id != consumer.id)
				} catch (error) {
					console.log("- Error Consumer (transportclose) => ", error)
				}
			})

			consumer.on("producerclose", () => {
				try {
					console.log(`Consumer (producerclose) ${consumerTransport.id} => ${consumer.id}`)
					socket.emit("close-consumer", { consumerId: consumer.id, appData })
					consumer.close()
					this.#consumers = this.#consumers.filter((c) => c.consumer.id != consumer.id)
				} catch (error) {
					console.log("- Error Consumer (producerclose) => ", error)
				}
			})

			consumer.on("producerpause", () => {
				try {
					console.log(`Consumer (producerpause) ${consumerTransport.id} => ${consumer.id}`)
				} catch (error) {
					console.log("- Error Consumer (producerpause) => ", error)
				}
			})

			consumer.on("producerresume", () => {
				try {
					console.log(`Consumer (producerresume) ${consumerTransport.id} => ${consumer.id}`)
				} catch (error) {
					console.log("- Error Consumer (producerresume) => ", error)
				}
			})

			consumer.on("score", (score) => {
				try {
					console.log(`Consumer (score) ${consumerTransport.id} => ${consumer.id} => `, score)
				} catch (error) {
					console.log("- Error Consumer (score) => ", error)
				}
			})

			consumer.on("layerschange", (layers) => {
				try {
					console.log(`Consumer (layerschange) ${consumerTransport.id} => ${consumer.id} => `, layers)
				} catch (error) {
					console.log("- Error Consumer (layerschange) => ", error)
				}
			})

			consumer.on("trace", (trace) => {
				try {
					console.log(`Consumer (trace) ${consumerTransport.id} => ${consumer.id} => ${trace}`)
				} catch (error) {
					console.log("- Error Consumer (trace) => ", error)
				}
			})

			consumer.on("rtp", (rtpPacket) => {
				try {
					console.log(`Consumer (rtp) ${consumerTransport.id} => ${consumer.id} => ${rtpPacket}`)
				} catch (error) {
					console.log("- Error Consumer (rtp) => ", error)
				}
			})

			consumer.observer.on("close", async () => {
				try {
					console.log(`Consumer Observer (close) ${consumerTransport.id} => ${consumer.id}`)
					await consumer.close()
					this.#consumers = this.#consumers.filter((c) => c.consumer.id != consumer.id)
				} catch (error) {
					console.log("- Error Consumer Observer (close) => ", error)
				}
			})

			return consumer
		} catch (error) {
			console.log("- Error Create Consumer : ", error)
		}
	}

	async resumeConsumer({ consumerId }) {
		try {
			const consumer = this.#consumers.find((c) => c.consumer.id == consumerId)
			await consumer.consumer.resume()
		} catch (error) {
			console.log("- Error Get Consumer : ", error)
		}
	}

	async pauseConsumer({ consumerId }) {
		try {
			const consumer = this.#consumers.find((c) => c.consumer.id == consumerId)
			await consumer.consumer.pause()
		} catch (error) {
			console.log("- Error Get Consumer : ", error)
		}
	}

	async connectRecvTransport({ dtlsParameters, serverConsumerTransportId }) {
		try {
			const consumerTransport = this.#transports.find((t) => t.transport.id == serverConsumerTransportId && t.transport.appData.consumer)
			if (consumerTransport) {
				await consumerTransport.transport.connect({ dtlsParameters })
			}
		} catch (error) {
			console.log("- Error Connect Receive Transport : ", error)
		}
	}

	async changeProducerAppData({ producerId, isActive }) {
		try {
			const producer = this.#producers.find((p) => p.producer.id == producerId)
			if (producer) {
				producer.producer.appData.isActive = isActive
			}
		} catch (error) {
			console.log("- Error CHange Producer App Data : ", error)
		}
	}

	async closeScreenSharing({ producerId }) {
		try {
			this.#producers = this.#producers.filter((p) => {
				if (p.producer.id != producerId) {
					return p
				} else {
					p.producer.close()
				}
			})
		} catch (error) {
			console.log("- Erorr Closing Screensharing Producer : ", error)
		}
	}
}

module.exports = { MediaSoup }
