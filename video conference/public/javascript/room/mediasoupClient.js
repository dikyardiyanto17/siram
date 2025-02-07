const mediasoupClient = require("mediasoup-client")

class StaticEvent {
	static async changeMicButton({ id, isActive }) {
		try {
			const myUserLicMic = document.getElementById(`mic-ul-${id}`)
			const microphoneButton = document.getElementById("mic-icon")
			const microphoneVideo = document.getElementById(`video-mic-${id}`)
			if (isActive) {
				myUserLicMic.src = "/assets/icons/user_list_mic_active.svg"
				microphoneButton.src = "/assets/icons/mic.svg"
				if (microphoneVideo) {
					microphoneVideo.src = "/assets/icons/mic_muted.svg"
				}
			} else {
				myUserLicMic.src = "/assets/icons/user_list_mic.svg"
				microphoneButton.src = "/assets/icons/mic_muted.svg"
				if (microphoneVideo) {
					microphoneVideo.src = "/assets/icons/mic_muted.svg"
				}
			}
		} catch (error) {
			console.log("- Error Change Mic Button : ", error)
		}
	}

	static changeUserList({ type, id, isActive }) {
		try {
			if (type == "mic") {
				const microphoneVideo = document.getElementById(`video-mic-${id}`)
				const targetElement = document.getElementById(`mic-ul-${id}`)
				if (isActive) {
					targetElement.src = "/assets/icons/user_list_mic_active.svg"
					microphoneVideo.src = "/assets/icons/mic_muted.svg"
				} else {
					targetElement.src = "/assets/icons/user_list_mic.svg"
					microphoneVideo.src = "/assets/icons/mic_muted.svg"
				}
			}
		} catch (error) {
			console.log("- Error : ", error)
		}
	}

	static warning({ message, back = false, time = 3000 }) {
		try {
			document.getElementById("warning-container").style.top = "50px"
			document.getElementById("warning-message").innerHTML = message
			setTimeout(() => {
				document.getElementById("warning-container").style.top = "-100%"
				document.getElementById("warning-message").innerHTML = ""
				if (back) {
					window.location.href = window.location.origin
				}
			}, time)
		} catch (error) {
			console.log("- Error Warning Message : ", error)
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
		appData: { label: "audio", isActive: true, picture: "" },
		disableTrackOnPause: true,
	}

	#rtpCapabilities = null
	#device = new mediasoupClient.Device()
	#videoParams = {
		track: null,
		codec: null,
		encodings: [],
		codecOptions: {
			videoGoogleStartBitrate: 1000,
		},
		appData: { label: "video", isActive: true, picture: "" },
		zeroRtpOnPause: true,
		disableTrackOnPause: true,
	}

	#encodingsvp8 = [
		{ scaleResolutionDownBy: 4, scalabilityMode: "L1T3", maxBitrate: 100000 },
		{ scaleResolutionDownBy: 2, scalabilityMode: "L1T3", maxBitrate: 300000 },
		{ scaleResolutionDownBy: 1, scalabilityMode: "L1T3", maxBitrate: 600000 },
	]
	#encodingsvp9 = [{ scalabilityMode: "L3T3", maxBitrate: 1500000 }]

	#screenSharingVideoParams = {
		track: null,
		appData: { label: "screensharing_video", isActive: true, picture: "" },
	}

	#screenSharingAudioParams = {
		track: null,
		appData: { label: "screensharing_audio", isActive: true, picture: "" },
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

	#videoDeviceId = ""
	#audioDeviceId = ""
	#speakerDeviceId = ""
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

	get screenSharingMode() {
		return this.#screenSharingMode
	}

	set screenSharingMode(condition) {
		this.#screenSharingMode = condition
	}

	set myStream(stream) {
		this.#mystream = stream
	}

	get videoProducer() {
		return this.#videoProducer
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
			this.constructor.warning({ message: "Gagal memuat device!", back: true })
			console.log("- Error Create Device:", error)
		}
	}

	async setEncoding() {
		try {
			let currentVideoType = videoType
			if (videoType != "vp8" && videoType != "vp9") {
				currentVideoType = "vp8"
			}
			const firstCodec = this.#device.rtpCapabilities.codecs.find((c) => c.mimeType.toLowerCase() === `video/${currentVideoType}`)
			console.log("- First Codec : ", firstCodec)
			this.#videoParams.codec = {
				...firstCodec,
			}
			if (currentVideoType == "vp8") {
				this.#videoParams.encodings = [...this.#encodingsvp8]
			} else {
				this.#videoParams.encodings = [...this.#encodingsvp9]
			}
		} catch (error) {
			this.constructor.warning({ message: "Gagal memuat encoding!", back: true })
			console.log("- Error Set Encoding : ", error)
		}
	}

	async getLabeledFaceDescriptions({ picture, name }) {
		const descriptions = []
		for (let i = 1; i <= 2; i++) {
			const img = await faceapi.fetchImage(picture, name)
			const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
			if (detections) {
				descriptions.push(detections.descriptor)
			}
		}
		return new faceapi.LabeledFaceDescriptors(name, descriptions)
	}

	async addFRVideo({ userId, username, stream, picture }) {
		try {
			const videoCollectionElement = document.getElementById("video-collection")

			const userContainerElement = document.createElement("div")
			userContainerElement.id = `vc-${userId}`
			userContainerElement.className = "video-user-container-1"

			videoCollectionElement.appendChild(userContainerElement)

			const userContainerNewElement = document.createElement("div")
			userContainerNewElement.className = "user-container"

			userContainerElement.appendChild(userContainerNewElement)

			const videoWrapperElement = document.createElement("div")
			videoWrapperElement.className = "video-wrapper"

			userContainerNewElement.appendChild(videoWrapperElement)

			const usernameElement = document.createElement("span")
			usernameElement.className = "video-username"
			usernameElement.id = `vu-${userId}`
			usernameElement.innerHTML = username

			userContainerNewElement.appendChild(usernameElement)

			const imageContainerElement = document.createElement("div")
			imageContainerElement.className = "video-mic-icon"
			imageContainerElement.innerHTML = `<img class="video-mic-image" src="/assets/icons/mic_level_2.svg"id="video-mic-${userId}" alt="mic_icon">`

			userContainerNewElement.appendChild(imageContainerElement)

			const videoElement = document.createElement("video")
			videoElement.id = `v-${userId}`
			videoElement.muted = true
			videoElement.autoplay = true

			videoElement.srcObject = new MediaStream([stream.getVideoTracks()[0]])

			videoWrapperElement.appendChild(videoElement)

			const frElement = document.createElement("div")
			frElement.className = "face-recognition"
			frElement.id = `face-recognition-${userId}`

			videoWrapperElement.appendChild(frElement)

			const labeledFaceDescriptors = await this.getLabeledFaceDescriptions({ picture, name: username })
			const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45)
			const canvas = faceapi.createCanvasFromMedia(videoElement)
			frElement.appendChild(canvas)
			const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight }
			faceapi.matchDimensions(canvas, displaySize)
			const ctx = canvas.getContext("2d")

			// Start face recognition interval using requestAnimationFrame for smooth rendering
			const frInterval = setInterval(async () => {
				// Draw the original video frame to the canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas before each draw
				ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height) // Scale the video to fit the canvas

				// Perform face recognition
				const detections = await faceapi.detectAllFaces(videoElement).withFaceLandmarks().withFaceDescriptors()
				const resizedDetections = faceapi.resizeResults(detections, displaySize)

				// Draw face recognition overlays
				resizedDetections.forEach((detection) => {
					const result = faceMatcher.findBestMatch(detection.descriptor)
					const box = detection.detection.box
					const drawBox = new faceapi.draw.DrawBox(box, {
						label: result.toString(),
						boxColor: result._distance <= 0.45 ? "blue" : "red",
						drawLabelOptions: { fontSize: 8 },
						lineWidth: 0.2,
					})
					drawBox.draw(canvas)
				})
			}, 50)

			// Capture the canvas as a video stream (this combines both video and face recognition annotations)
			const combinedStream = canvas.captureStream()
			const audioTrack = stream.getAudioTracks()[0]

			const finalStream = new MediaStream()
			finalStream.addTrack(combinedStream.getVideoTracks()[0]) // Use the canvas as the video track
			if (audioTrack) {
				finalStream.addTrack(audioTrack) // Add audio track if present
			}

			return finalStream
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async getMyStream({ faceRecognition, picture, userId, username }) {
		try {
			this.#mystream = await navigator.mediaDevices.getUserMedia({ audio: { ...this.#audioSetting }, video: true })
		} catch (error) {
			if (
				error == "NotAllowedError: Permission denied" ||
				(typeof error === "string" && error.includes("DOMException")) ||
				error instanceof DOMException
			) {
				this.constructor.warning({ message: "Permintaan izin kamera/microphone di tolak!", back: true })
			}
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
						producerPaused: p.producerPaused,
					})
				})
			})
		} catch (error) {
			this.constructor.warning({ message: "Gagal menyambungkan ke server!", back: true })
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
						if (e == "connected") {
							document.getElementById("loading-id").className = "loading-hide"
						}
						if (e == "failed") {
							window.location.href = `${window.location.origin}/?rid=${roomId}&pw=${password}`
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
				await this.connectSendTransport({ socket, picture: usersVariable.picture, userId })
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
						window.location.href = `${window.location.origin}/?rid=${roomId}&pw=${password}`
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

	async connectSendTransport({ socket, picture, userId }) {
		try {
			this.#audioParams.track = this.#mystream.getAudioTracks()[0]
			this.#videoParams.track = this.#mystream.getVideoTracks()[0]
			this.#audioParams.appData.picture = picture
			this.#videoParams.appData.picture = picture
			this.#audioProducer = await this.#producerTransport.produce(this.#audioParams)
			this.#videoProducer = await this.#producerTransport.produce(this.#videoParams)
			this.#videoProducer.on("trackended", () => {
				// window.location.reload()
				console.log("video track ended")
			})

			this.#videoProducer.on("transportclose", () => {
				window.location.href = `${window.location.origin}/?rid=${roomId}&pw=${password}`
				console.log("video transport ended")
			})

			this.#videoProducer.observer.on("close", () => {
				console.log("video observer close")
			})

			this.#videoProducer.on("transportclose", () => {
				window.location.href = `${window.location.origin}/?rid=${roomId}&pw=${password}`
				console.log("video transport ended")
			})

			this.#videoProducer.observer.on("close", () => {
				console.log("video observer close")
			})

			this.#videoProducer.observer.on("pause", () => {
				console.log("video observer pause")
				const videoPicture = document.getElementById(`turn-off-${userId}`)
				document.getElementById("camera-icon").src = "/assets/icons/camera_off.svg"
				document.getElementById(`camera-ul-${userId}`).src = "/assets/icons/user_list_camera.svg"
				if (videoPicture.classList.contains("d-none")) {
					videoPicture.classList.remove("d-none")
				}
			})

			this.#videoProducer.observer.on("resume", () => {
				console.log("video observer resume")
				const videoPicture = document.getElementById(`turn-off-${userId}`)
				document.getElementById("camera-icon").src = "/assets/icons/camera.svg"
				document.getElementById(`camera-ul-${userId}`).src = "/assets/icons/user_list_camera_active.svg"
				if (!videoPicture.classList.contains("d-none")) {
					videoPicture.classList.add("d-none")
				}
			})

			// possible bug
			this.#audioProducer.on("trackended", () => {
				console.log("audio track ended")
				this.constructor.warning({ message: "Microphone sedang bermasalah!\nSedang memuat ulang halaman!", back: true })
			})

			this.#audioProducer.on("transportclose", () => {
				console.log("audio transport ended")
			})

			this.#audioProducer.observer.on("close", () => {
				console.log("audio observer close")
			})

			this.#audioProducer.observer.on("pause", () => {
				console.log("- Audio Producer is paused")
				this.constructor.changeMicButton({ id: userId, isActive: false })
			})

			this.#audioProducer.observer.on("resume", () => {
				console.log("- Audio Producer is resumed")
				this.constructor.changeMicButton({ id: userId, isActive: true })
			})

			this.#videoProducer.setMaxSpatialLayer(2)
		} catch (error) {
			console.log("- Error Connect Transport Producer : ", error)
		}
	}

	async signalNewConsumerTransport({ remoteProducerId, socket, userId, roomId, usersVariable, socketId, index = null, producerPaused }) {
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
						producerPaused,
					})
				}
			}

			await connectingRecvTransport()
		} catch (error) {
			console.log("- Error Signaling New Consumer Transport : ", error)
		}
	}

	async connectRecvTransport({ socket, remoteProducerId, roomId, userId, usersVariable, socketId, index, producerPaused }) {
		try {
			await socket.emit(
				"consume",
				{
					rtpCapabilities: this.#device.rtpCapabilities,
					remoteProducerId,
					serverConsumerTransportId: this.#consumerTransport.id,
					roomId,
					userId,
					producerPaused,
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
								if (params.kind == "video" && appData.label == "video") {
									const videoPicture = document.getElementById(`turn-off-${userId}`)
									document.getElementById(`camera-ul-${userId}`).src = "/assets/icons/user_list_camera.svg"
									if (videoPicture.classList.contains("d-none")) {
										videoPicture.classList.remove("d-none")
									}
								}
								if (params.kind == "audio" && appData.label == "audio") {
									this.constructor.changeUserList({ type: "mic", isActive: false, id: userId })
								}
							} catch (error) {
								console.log("- Error Consumer Observer (pause) : ", error)
							}
						})
						consumer.observer.on("resume", () => {
							try {
								console.log("Consumer Observer (resumer) => ", consumer.id)
								if (params.kind == "video" && appData.label == "video") {
									const videoPicture = document.getElementById(`turn-off-${userId}`)
									document.getElementById(`camera-ul-${userId}`).src = "/assets/icons/user_list_camera_active.svg"
									if (!videoPicture.classList.contains("d-none")) {
										videoPicture.classList.add("d-none")
									}
								}
								if (params.kind == "audio" && appData.label == "audio") {
									this.constructor.changeUserList({ type: "mic", isActive: true, id: userId })
								}
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
							username: params.username,
							authority: params.authority,
							consumerId: consumer.id,
							kind: params.kind,
							track,
							socketId,
							focus: false,
							socket,
							index,
							appData,
						})

						// Possible bug
						// if (params.kind == "audio" && !appData.isActive) {
						// 	this.reverseConsumerTrack({ userId: userId, isActive: false })
						// }

						let checkVideo = await usersVariable.checkVideo({ userId })
						if (checkVideo && params.kind == "video") {
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId }, async ({ status, message }) => {
								try {
									if (status && message != "producer-paused") {
										consumer.resume()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}

						if (appData.label == "screensharing_video") {
							usersVariable.changeScreenSharingMode({ status: true, userId, socket, username: params.username, picture: appData.picture })
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId }, async ({ status, message }) => {
								try {
									if (status && message != "producer-paused") {
										consumer.resume()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}

						if (params.kind == "audio" && !params.producerPaused) {
							socket.emit("consumer-resume", { serverConsumerId: params.serverConsumerId }, async ({ status, message }) => {
								try {
									if (status && message != "producer-paused") {
										consumer.resume()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}

						if (params.kind == "video" && params.producerPaused) {
							socket.emit("consumer-pause", { serverConsumerId: consumer.id }, async ({ status, message }) => {
								try {
									if (status) {
										consumer.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}

						if (params.kind == "audio" && params.producerPaused) {
							socket.emit("consumer-pause", { serverConsumerId: consumer.id }, async ({ status, message }) => {
								try {
									if (status) {
										consumer.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
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

	async checkMic() {
		return this.#mystream.getAudioTracks()[0].enabled
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
			if (this.#screenSharingStatus) {
				this.#screenSharingStatus = false
				this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing.svg"
				this.#screenSharingButton.classList.remove("active")
				if (this.#screenSharingVideoProducer) {
					socket.emit("stop-screensharing", { producerId: this.#screenSharingVideoProducer?.id, label: "screensharing_video" })
				}
				if (this.#screenSharingStream) {
					const tracks = await this.#screenSharingStream.getTracks()
					tracks.forEach((track) => {
						track.stop()
					})
				}
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

			if (this.#screenSharingStream) {
				if (await this.#screenSharingStream.getAudioTracks()[0]) {
					this.#screenSharingAudioParams.track = await this.#screenSharingStream.getAudioTracks()[0]

					this.#screenSharingAudioProducer = await this.#producerTransport.produce(this.#screenSharingAudioParams)

					this.#screenSharingStream.getAudioTracks()[0].onended = () => {
						try {
							socket.emit("stop-screensharing", { producerId: this.#screenSharingAudioProducer.id, label: "screensharing_audio" })
							console.log("stream screensharing track ended")
						} catch (error) {
							console.log("- Error onended screensharing : ", error)
						}
					}

					this.#screenSharingAudioProducer.on("trackended", () => {
						socket.emit("stop-screensharing", { producerId: this.#screenSharingAudioProducer.id, label: "screensharing_audio" })
						console.log("screensharing track ended")
					})

					this.#screenSharingAudioProducer.observer.on("close", () => {
						console.log("-> screensharing producer close")
					})

					this.#screenSharingAudioProducer.on("transportclose", () => {
						console.log("screensharing transport ended")
					})

					this.#screenSharingAudioProducer.observer.on("close", () => {
						console.log("screensharing observer close")
					})
				}
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
			} else {
				return null
			}
		} catch (error) {
			this.#screenSharingButton.firstElementChild.src = "/assets/icons/screen_sharing.svg"
			this.#screenSharingButton.classList.remove("active")
			this.#screenSharingStatus = false
			console.log("- Error Getting Screen Sharing : ", error)
			return null
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

	async getCameraOptions({ userId }) {
		try {
			const listCameraContainer = document.getElementById("video-options")
			let videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput")
			const currentDevice = await this.#mystream.getVideoTracks()[0].getSettings().deviceId
			this.#videoDeviceId = currentDevice
			videoDevices.forEach((videoList) => {
				let currentCameraIcons = '<i class="fa-regular fa-square"></i>'
				if (videoList.deviceId === currentDevice) {
					currentCameraIcons = '<i class="fa-regular fa-square-check"></i>'
				}
				const cameraLabel = document.createElement("li")
				cameraLabel.innerHTML = `<span class="input-options-icons">${currentCameraIcons}</span><span>${videoList.label}</span>`
				cameraLabel.id = videoList.deviceId
				cameraLabel.addEventListener("click", async (e) => {
					e.stopPropagation()
					const currentActiveCameraIcon = document.getElementById(this.#videoDeviceId).firstChild.firstChild
					currentActiveCameraIcon.className = "fa-regular fa-square"
					this.#videoDeviceId = videoList.deviceId
					document.getElementById(this.#videoDeviceId).firstChild.firstChild.className = "fa-regular fa-square-check"

					let config = {
						video: {
							deviceId: { exact: this.#videoDeviceId },
						},
					}
					const newStream = await navigator.mediaDevices.getUserMedia(config)
					if (document.getElementById(`v-${userId}`).srcObject.getVideoTracks()[0]) {
						await document.getElementById(`v-${userId}`).srcObject.getVideoTracks()[0].stop()
						await document
							.getElementById(`v-${userId}`)
							.srcObject.removeTrack(await document.getElementById(`v-${userId}`).srcObject.getVideoTracks()[0])
						await document.getElementById(`v-${userId}`).srcObject.addTrack(newStream.getVideoTracks()[0])
					}
					await this.#mystream.getVideoTracks()[0].stop()
					await this.#mystream.removeTrack(await this.#mystream.getVideoTracks()[0])
					await this.#mystream.addTrack(await newStream.getVideoTracks()[0])
					await this.#videoProducer.replaceTrack({ track: await newStream.getVideoTracks()[0] })
				})
				listCameraContainer.appendChild(cameraLabel)
			})
		} catch (error) {
			console.log("- Error Get Camera Options : ", error)
			this.constructor.warning({ message: "Gagal mendapatkan pilihan kamera yang tersedia!", back: true })
		}
	}

	async getMicOptions({ usersVariable }) {
		try {
			let audioDevices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput")
			// let audioDevicesOutput = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audiooutput")

			const currentDevice = await this.#mystream.getAudioTracks()[0].getSettings().deviceId
			this.#audioDeviceId = currentDevice
			const micOptionsContainer = document.getElementById("mic-options")
			// const audioOutputOptions = document.getElementById("audio-output")
			audioDevices.forEach((audio, index) => {
				let newElement = document.createElement("li")
				newElement.id = audio.deviceId + "-audio-input"
				let currentAudio = '<i class="fa-regular fa-square"></i>'

				if (audio.deviceId === this.#audioDeviceId) {
					currentAudio = `<i class="fa-regular fa-square-check"></i>`
				}

				newElement.innerHTML = `<span class="mic-options-icons">${currentAudio}</span><span>${audio.label}</span>`
				micOptionsContainer.append(newElement)
				newElement.addEventListener("click", (e) => {
					try {
						this.switchMicrophone({ deviceId: audio.deviceId, usersVariable })
					} catch (error) {
						console.log("- Error Switching Microphone : ", error)
					}
				})
			})
			// audioDevicesOutput.forEach((audioDevices, index) => {
			// 	let currentAudio = '<i class="fa-regular fa-square"></i>'
			// 	if (index === 0) {
			// 		currentAudio = `<i class="fa-regular fa-square-check"></i>`
			// 		this.#speakerDeviceId = audioDevices.deviceId
			// 	}
			// 	let newElement = document.createElement("li")
			// 	newElement.id = audioDevices.deviceId + "-audio-output"
			// 	newElement.innerHTML = `<span class="mic-options-icons">${currentAudio}</span><span>${audioDevices.label}</span>`
			// 	micOptionsContainer.appendChild(newElement)
			// 	newElement.addEventListener("click", (e) => {
			// 		e.stopPropagation()
			// 		const iconSpeaker = document.getElementById(`${this.#speakerDeviceId}-audio-output`).firstChild.firstChild
			// 		iconSpeaker.className = "fa-regular fa-square"
			// 		this.#speakerDeviceId = audioDevices.deviceId
			// 		const currentSpeaker = document.getElementById(`${this.#speakerDeviceId}-audio-output`).firstChild.firstChild
			// 		currentSpeaker.className = "fa-regular fa-square-check"
			// 		usersVariable.allUsers.forEach((u) => {
			// 			let theAudio = document.getElementById(`a-${u.userId}`)

			// 			console.log(theAudio)
			// 			if (theAudio && typeof theAudio.sinkId !== "undefined") {
			// 				console.log("- Sink Id Is Exist")
			// 				theAudio
			// 					.setSinkId(audioDevices.deviceId)
			// 					.then(() => {
			// 						console.log(`Success, audio output device attached: ${audioDevices.deviceId}`)
			// 					})
			// 					.catch((error) => {
			// 						let errorMessage = error
			// 						if (error.name === "SecurityError") {
			// 							errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`
			// 						}
			// 						console.error(errorMessage)
			// 					})
			// 			} else {
			// 				console.warn("Browser does not support output device selection.")
			// 			}
			// 		})
			// 	})
			// })
		} catch (error) {
			console.log("- Error Getting Mic Options : ", error)
			this.constructor.warning({ message: "Gagal mendapatkan pilihan microphone yang tersedia!", back: true })
		}
	}

	async switchMicrophone({ deviceId, usersVariable }) {
		try {
			let previousIcon = document.getElementById(`${this.#audioDeviceId}-audio-input`).firstChild.firstChild
			previousIcon.className = `fa-regular fa-square`
			let iconCheckListMicrophone = document.getElementById(`${deviceId}-audio-input`).firstChild.firstChild
			iconCheckListMicrophone.className = `fa-regular fa-square-check`
			this.#audioDeviceId = deviceId
			const myVideo = document.getElementById(`v-${userId}`)

			let config = {
				audio: {
					deviceId: { exact: deviceId },
					autoGainControl: false,
					noiseSuppression: true,
					echoCancellation: true,
				},
			}
			// myVideo.srcObject.getAudioTracks()[0].stop()

			this.#mystream.getAudioTracks()[0].stop()

			let newStream = await navigator.mediaDevices.getUserMedia(config)
			newStream.getAudioTracks()[0].enabled = this.#mystream.getAudioTracks()[0].enabled
			// this.#mystream.getAudioTracks()[0].stop()
			// console.log(usersVariable.userId, document.getElementById(`audio-visualizer-${usersVariable.userId}`).remove())
			this.#mystream.removeTrack(this.#mystream.getAudioTracks()[0])
			this.#mystream.addTrack(newStream.getAudioTracks()[0])
			this.#audioProducer.replaceTrack({ track: newStream.getAudioTracks()[0] })
			// document.getElementById(`video-mic-${usersVariable.userId}`).remove()
			await usersVariable.createAudioVisualizer({ id: usersVariable.userId, track: newStream.getAudioTracks()[0] })
		} catch (error) {
			console.log("- Error Switching Microphone : ", error)
		}
	}
}

module.exports = {
	MediaSoupClient,
}
