const mediasoupClient = require("mediasoup-client")

class MediaSoupClient {
	#consumingTransport = []
	#mystream = null
	#audioSetting = {
		autoGainControl: false,
		noiseSuppression: true,
		echoCancellation: true,
	}

	#audioParams = {
		track: null,
		codecOptions: {
			opusDtx: false,
		},
		zeroRtpOnPause: true,
		appData: { label: "audio", isActive: true },
	}

	#rtpCapabilities = null
	#device = new mediasoupClient.Device()
	#videoParams = {
		track: null,
		codec: null,
		encodings: [
			{ scaleResolutionDownBy: 4, scalabilityMode: "L1T3", maxBitrate: 100000 },
			{ scaleResolutionDownBy: 2, scalabilityMode: "L1T3", maxBitrate: 300000 },
			{ scaleResolutionDownBy: 1, scalabilityMode: "L1T3", maxBitrate: 600000 },
		],
		codecOptions: {
			videoGoogleStartBitrate: 1000,
		},
		appData: { label: "video", isActive: true },
	}

	#producerTransport = null
	#consumerTransport = null
	#audioProducer = null
	#videoProducer = null
	#consumers = []

	get rtpCapabilities() {
		return this.#rtpCapabilities
	}

	set rtpCapabilities(capabilities) {
		this.#rtpCapabilities = capabilities
	}

	get myStream() {
		return this.#mystream
	}

	set myStream(stream) {
		this.#mystream = stream
	}

	async createDevice() {
		try {
			if (!this.#rtpCapabilities) {
				throw new Error("RTP capabilities are not set")
			}

			await this.#device.load({
				routerRtpCapabilities: this.#rtpCapabilities,
			})

			console.log("Device created successfully")
		} catch (error) {
			console.log("- Error Create Device:", error)
		}
	}

	async setEncoding() {
		try {
			const firstCodec = this.#device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === "video/vp8")
			this.#videoParams.codec = {
				...firstCodec,
			}
		} catch (error) {
			console.log("- Error Set Encoding : ", error)
		}
	}

	async getMyStream() {
		try {
			this.#mystream = await navigator.mediaDevices.getUserMedia({ audio: this.#audioSetting, video: true })
		} catch (error) {
			console.log("- Error Get My Stream : ", error)
		}
	}

	async getProducers({ socket, roomId, userId, usersVariable }) {
		try {
			socket.emit("get-producers", { roomId: roomId, userId }, async ({ producerList }) => {
				producerList.forEach((p) => {
					this.signalNewConsumerTransport({ remoteProducerId: p.producerId, socket, userId: p.userId, roomId, usersVariable, socketId: p.socketId })
				})
			})
		} catch (error) {
			console.log("- Error Get Producer : ", error)
		}
	}

	async createSendTransport({ socket, roomId, userId, usersVariable }) {
		try {
			socket.emit("create-webrtc-transport", { consumer: false, roomId, userId }, async ({ params }) => {
				this.#producerTransport = this.#device.createSendTransport(params)
				this.#producerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
					try {
						console.log("Transport Producer Is Connected : ", this.#producerTransport.id)
						await socket.emit("transport-connect", {
							dtlsParameters,
							userId,
						})
						callback()
					} catch (error) {
						errback("- Error Connecting Transport : ", error)
					}
				})
				this.#producerTransport.on("produce", async (parameters, callback, errback) => {
					try {
						console.log("Transport Producer Is Created : ", this.#producerTransport.id)
						await socket.emit(
							"transport-produce",
							{
								kind: parameters.kind,
								rtpParameters: parameters.rtpParameters,
								appData: parameters.appData,
								roomId,
								userId,
							},
							async ({ id, producersExist, kind }) => {
								callback({ id })
								if (producersExist && kind == "audio") {
									await this.getProducers({ socket, roomId, userId, usersVariable })
								}
							}
						)
					} catch (error) {
						errback(error)
					}
				})
				this.#producerTransport.on("connectionstatechange", async (e) => {
					try {
						console.log("- State Change Producer : ", e)
						if (e == "failed") {
							window.location.reload()
						}
					} catch (error) {
						console.log("- Error Connecting State Change Producer : ", error)
					}
				})

				this.#producerTransport.on("icegatheringstatechange", (iceGatheringState) => {
					try {
						console.log("- Gathering Ice State : ", iceGatheringState)
					} catch (error) {
						console.log("- Error Ice Gathering State Producer : ", error)
					}
				})

				this.#producerTransport.observer.on("close", () => {
					try {
						console.log("- Producer Transport Is Closed : ", this.#producerTransport.id)
					} catch (error) {
						console.log("- Error Close Transport Producer : ", error)
					}
				})

				this.#producerTransport.observer.on("newproducer", (producer) => {
					try {
						console.log("- Create New Producer : ", producer.id)
					} catch (error) {
						console.log(`- Error Create New Producer ${producer.id}: `, error)
					}
				})

				this.#producerTransport.observer.on("newconsumer", (consumer) => {
					try {
						console.log("- Create New Consumer : ", consumer.id)
					} catch (error) {
						console.log(`- Error Create New Consumer ${consumer.id} : `, error)
					}
				})
				await this.createConsumerTransport({ socket, roomId, userId })
				await this.connectSendTransport({ socket })
			})
		} catch (error) {
			console.log("- Error Create Send Transport : ", error)
		}
	}

	async createConsumerTransport({ socket, roomId, userId }) {
		try {
			socket.emit("create-webrtc-transport", { consumer: true, roomId, userId }, ({ params }) => {
				this.#consumerTransport = this.#device.createRecvTransport(params)

				this.#consumerTransport.on("connectionstatechange", async (e) => {
					if (e === "failed") {
						window.location.reload()
					}
					console.log("- Receiver Transport State : ", e)
				})

				this.#consumerTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
					try {
						await socket.emit("transport-recv-connect", { dtlsParameters, serverConsumerTransportId: params.id })
						callback()
					} catch (error) {
						errback(error)
					}
				})
			})
		} catch (error) {
			console.log("- Error Create Consumer Transport : ", error)
		}
	}

	async connectSendTransport({ socket }) {
		try {
			this.#audioParams.track = this.#mystream.getAudioTracks()[0]
			this.#videoParams.track = this.#mystream.getVideoTracks()[0]
			this.#audioProducer = await this.#producerTransport.produce(this.#audioParams)
			this.#videoProducer = await this.#producerTransport.produce(this.#videoParams)
			this.#videoProducer.on("trackended", () => {
				window.location.reload()
				console.log("video track ended")
			})

			this.#videoProducer.on("transportclose", () => {
				window.location.reload()
				console.log("video transport ended")
			})

			this.#audioProducer.on("trackended", () => {
				console.log("audio track ended")
			})

			this.#audioProducer.on("transportclose", () => {
				console.log("audio transport ended")
			})
		} catch (error) {
			console.log("- Error Connect Transport Producer : ", error)
		}
	}

	async signalNewConsumerTransport({ remoteProducerId, socket, userId, roomId, usersVariable, socketId }) {
		try {
			if (this.#consumingTransport.includes(remoteProducerId)) return
			this.#consumingTransport.push(remoteProducerId)
			let totalReconnecting = 0
			const connectingRecvTransport = async () => {
				if (!this.#consumerTransport) {
					totalReconnecting++
					setTimeout(() => {
						connectingRecvTransport()
					}, 1000)
				} else if (totalReconnecting >= 20) {
					console.log("Receiver Transport Wont Connected")
				} else {
					await this.connectRecvTransport({
						socket,
						remoteProducerId,
						roomId,
						userId,
						usersVariable,
						socketId,
					})
				}
			}

			await connectingRecvTransport()
		} catch (error) {
			console.log("- Error Signaling New Consumer Transport : ", error)
		}
	}

	async connectRecvTransport({ socket, remoteProducerId, roomId, userId, usersVariable, socketId }) {
		try {
			await socket.emit(
				"consume",
				{
					rtpCapabilities: this.#device.rtpCapabilities,
					remoteProducerId,
					serverConsumerTransportId: this.#consumerTransport.id,
					roomId,
					userId,
				},
				async ({ params }) => {
					try {
						const streamId = params.kind == "audio" ? `audio-${params.userId}` : `video-${params.userId}`
						const consumer = await this.#consumerTransport.consume({
							id: params.id,
							producerId: params.producerId,
							kind: params.kind,
							rtpParameters: params.rtpParameters,
							streamId,
						})

						const { track } = consumer
						consumer.on("transportclose", () => {
							try {
								console.log("- Transport Consumer Closed ")
							} catch (error) {
								console.log("- Error Transport Consumer Close : ", error)
							}
						})
						this.#consumers.push({ userId, consumer })
						await usersVariable.addAllUser({ userId, admin: params.admin, consumerId: consumer.id, kind: params.kind, track, socketId })
						socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId })
					} catch (error) {
						console.log("- Error Consuming : ", error)
					}
				}
			)
		} catch (error) {
			console.log("- Error Connecting Receive Transport : ", error)
		}
	}

	async closeUser({ userId }) {
		try {
		} catch (error) {
			console.log("- Error Close User : ", error)
		}
	}

	async closeConsumer({ consumerId }) {
		try {
			this.#consumers = this.#consumers.filter((c) => {
				if (c.consumer.id == consumerId) {
					c.consumer.close()
				} else {
					return c
				}
			})
		} catch (error) {
			console.log("- Error Close Consumer : ", error)
		}
	}
}

module.exports = {
	MediaSoupClient,
}
