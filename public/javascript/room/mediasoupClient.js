const mediasoupClient = require("mediasoup-client")

class StaticEvent {
	static async changeMicButton({ id, isActive }) {
		try {
			const myUserLicMic = document.getElementById(`mic-ul-${id}`)
			const microphoneButton = document.getElementById("mic-icon")
			if (isActive) {
				myUserLicMic.src = "/assets/icons/user_list_mic_active.svg"
				microphoneButton.src = "/assets/icons/mic.svg"
			} else {
				myUserLicMic.src = "/assets/icons/user_list_mic.svg"
				microphoneButton.src = "/assets/icons/mic_muted.svg"
			}
		} catch (error) {
			console.log("- Error Change Mic Button : ", error)
		}
	}

	static changeUserList({ type, id, isActive }) {
		try {
			if (type == "mic") {
				const targetElement = document.getElementById(`mic-ul-${id}`)
				if (isActive) {
					targetElement.src = "/assets/icons/user_list_mic_active.svg"
				} else {
					targetElement.src = "/assets/icons/user_list_mic.svg"
				}
			}
		} catch (error) {
			console.log("- Error : ", error)
		}
	}
}

class MediaSoupClient extends StaticEvent {
	#consumingTransport = []
	#mystream = null
	#screenSharingStream = null
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

	#screenSharingVideoParams = {
		track: null,
		appData: { label: "screensharing_video", isActive: true },
	}

	#screenSharingAudioParams = {
		track: null,
		appData: { label: "screensharing_audio", isActive: true },
	}

	#producerTransport = null
	#consumerTransport = null
	#audioProducer = null
	#videoProducer = null
	#screenSharingAudioProducer = null
	#screenSharingVideoProducer = null
	#consumers = []
	#screenSharingMode = false
	#screenSharingButton = false
	#screenSharingStatus = document.getElementById("screen-sharing-button")
	constructor() {
		super()
		// Screen Sharing
		this.#screenSharingMode = false
		this.#screenSharingStatus = false
		this.#screenSharingButton = document.getElementById("screen-sharing-button")
	}

	get rtpCapabilities() {
		return this.#rtpCapabilities
	}

	set rtpCapabilities(capabilities) {
		this.#rtpCapabilities = capabilities
	}

	get audioProducer() {
		return this.#audioProducer
	}

	set audioProducer(newAudioProducer) {
		this.#audioProducer = newAudioProducer
	}

	get consumers() {
		return this.#consumers
	}

	set consumers(newConsumers) {
		this.#consumers = newConsumers
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
				producerList.forEach((p, index) => {
					this.signalNewConsumerTransport({
						remoteProducerId: p.producerId,
						socket,
						userId: p.userId,
						roomId,
						usersVariable,
						socketId: p.socketId,
						index: p.indexing,
					})
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
								} else {
									usersVariable.flagRecentlyJoined = false
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

			this.#videoProducer.observer.on("close", () => {
				console.log("video observer close")
			})

			this.#audioProducer.on("trackended", () => {
				console.log("audio track ended")
			})

			this.#audioProducer.on("transportclose", () => {
				console.log("audio transport ended")
			})

			this.#audioProducer.observer.on("close", () => {
				console.log("audio observer close")
			})
		} catch (error) {
			console.log("- Error Connect Transport Producer : ", error)
		}
	}

	async signalNewConsumerTransport({ remoteProducerId, socket, userId, roomId, usersVariable, socketId, index = null }) {
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
						index,
					})
				}
			}

			await connectingRecvTransport()
		} catch (error) {
			console.log("- Error Signaling New Consumer Transport : ", error)
		}
	}

	async connectRecvTransport({ socket, remoteProducerId, roomId, userId, usersVariable, socketId, index }) {
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
						const { appData } = params
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

						consumer.observer.on("close", () => {
							try {
								usersVariable.closeConsumer({ ...appData, consumerId: consumer.id, socket })
								console.log("Consumer Observer (closer) => ", consumer.id)
							} catch (error) {
								console.log("- Error Consumer Observer (close) : ", error)
							}
						})
						consumer.observer.on("pause", () => {
							try {
								console.log("Consumer Observer (pauser) => ", consumer.id)
							} catch (error) {
								console.log("- Error Consumer Observer (pause) : ", error)
							}
						})
						consumer.observer.on("resume", () => {
							try {
								console.log("Consumer Observer (resumer) => ", consumer.id)
							} catch (error) {
								console.log("- Error Consumer Observer (resume) : ", error)
							}
						})
						consumer.observer.on("trackended", () => {
							try {
								console.log("Consumer Observer (trackended) => ", consumer.id)
							} catch (error) {
								console.log("- Error Consumer Observer (trackended) : ", error)
							}
						})
						this.#consumers.push({ userId, consumer })

						await usersVariable.addAllUser({
							userId,
							admin: params.admin,
							consumerId: consumer.id,
							kind: params.kind,
							track,
							socketId,
							focus: false,
							socket,
							index,
							appData,
						})

						if (params.kind == "audio" && !appData.isActive) {
							this.reverseConsumerTrack({ userId: userId, isActive: false })
						}

						let checkVideo = await usersVariable.checkVideo({ userId })
						if (checkVideo && params.kind == "video") {
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId })
						}

						if (appData.label == "screensharing_video") {
							usersVariable.screenSharingMode({ status: true, userId, socket })
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId })
						}
						if (params.kind == "audio") {
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId })
						}
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

	async reverseMicrophone({ userId }) {
		try {
			this.#mystream.getAudioTracks()[0].enabled = !this.#mystream.getAudioTracks()[0].enabled
			this.#audioProducer.appData.isActive = this.#mystream.getAudioTracks()[0].enabled
			await this.constructor.changeMicButton({ id: userId, isActive: this.#mystream.getAudioTracks()[0].enabled })
			return this.#mystream.getAudioTracks()[0].enabled
		} catch (error) {
			console.log("- Error Reverse Microphone : ", error)
		}
	}

	async reverseConsumerTrack({ userId, isActive }) {
		try {
			const audioTrackElement = document.getElementById(`a-${userId}`)
			if (audioTrackElement) {
				audioTrackElement.srcObject.getAudioTracks()[0].enabled = isActive
				this.constructor.changeUserList({ type: "mic", id: userId, isActive })
			}
		} catch (error) {
			console.log("- Error Reverse Consumer Track : ", error)
		}
	}

	async changeScreenSharingButton({ socket }) {
		try {
			console.log(this.#screenSharingStatus)
			if (this.#screenSharingStatus) {
				this.#screenSharingStatus = false
				this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing.svg"
				this.#screenSharingButton.classList.remove("active")
				socket.emit("stop-screensharing", { producerId: this.#screenSharingVideoProducer?.id, label: "screensharing_video" })
				return null
			} else {
				this.#screenSharingStatus = true
				this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing_active.svg"
				this.#screenSharingButton.classList.add("active")
				return await this.getScreenSharing({ socket })
			}
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async getScreenSharing({ socket }) {
		try {
			let config = {
				video: {
					cursor: "always",
					displaySurface: "window",
					chromeMediaSource: "desktop",
				},
				audio: true,
			}

			this.#screenSharingStream = await navigator.mediaDevices.getDisplayMedia(config)

			this.#screenSharingVideoParams.track = await this.#screenSharingStream.getVideoTracks()[0]

			this.#screenSharingVideoProducer = await this.#producerTransport.produce(this.#screenSharingVideoParams)

			this.#screenSharingStream.getVideoTracks()[0].onended = () => {
				try {
					socket.emit("stop-screensharing", { producerId: this.#screenSharingVideoProducer.id, label: "screensharing_video" })
					console.log("stream screensharing track ended")
				} catch (error) {
					console.log("- Error onended screensharing : ", error)
				}
			}

			this.#screenSharingVideoProducer.on("trackended", () => {
				socket.emit("stop-screensharing", { producerId: this.#screenSharingVideoProducer.id, label: "screensharing_video" })
				console.log("screensharing track ended")
			})

			this.#screenSharingVideoProducer.observer.on("close", () => {
				console.log("-> screensharing producer close")
			})

			this.#screenSharingVideoProducer.on("transportclose", () => {
				console.log("screensharing transport ended")
			})

			this.#screenSharingVideoProducer.observer.on("close", () => {
				console.log("screensharing observer close")
			})

			this.#screenSharingMode = true
			return this.#screenSharingStream
		} catch (error) {
			this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing.svg"
			this.#screenSharingButton.classList.remove("active")
			console.log("- Error Getting Screen Sharing : ", error)
		}
	}

	async closeScreenSharing({ producerId }) {
		try {
			this.#screenSharingMode = false
			this.#screenSharingStatus = false
			this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing.svg"
			this.#screenSharingButton.classList.remove("active")
			if (this.#screenSharingAudioProducer != null && this.#screenSharingAudioProducer.id == producerId) {
				this.#screenSharingAudioProducer.close()
				this.#screenSharingAudioProducer = null
			}

			if (this.#screenSharingVideoProducer != null && this.#screenSharingVideoProducer.id == producerId) {
				this.#screenSharingVideoProducer.close()
				this.#screenSharingVideoProducer = null
			}
		} catch (error) {
			console.log("- Error Close Screen Sharing : ", error)
		}
	}
}

module.exports = {
	MediaSoupClient,
}
