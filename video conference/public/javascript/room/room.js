const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const { EventListener } = require("./eventListener")
const { Users } = require("./user")
const { MediaSoupClient } = require("./mediasoupClient")
const url = window.location.pathname
const parts = url.split("/")
const RecordRTC = require("recordrtc")

const eventListenerCollection = new EventListener({ micStatus: false, cameraStatus: false, roomId: roomName })
const usersVariable = new Users()
const mediasoupClientVariable = new MediaSoupClient()
usersVariable.faceRecognition = faceRecognition

const getOS = () => {
	try {
		const userAgent = navigator.userAgent.toLowerCase()
		const platform = navigator.platform.toLowerCase()
		if (platform.includes("win")) return "Windows"
		if (platform.includes("mac")) return "MacOS"
		if (platform.includes("linux") && !userAgent.includes("android")) return "Linux"
		if (userAgent.includes("android")) return "Android"
		if (/iphone|ipad|ipod/.test(userAgent) || platform.includes("ios")) return "iOS"

		return "Unknown OS"
	} catch (error) {
		console.log("- Error Get OS:", error)
		return "Unknown OS"
	}
}

const os = getOS()
console.log("- OS : ", os)

mediasoupClientVariable.os = os
usersVariable.os = os

const getResponsive = async () => {
	try {
		const os = await getOS()
		if (os === "Android" || os === "iOS") {
			const shareButton = document.getElementById("share-link-button")
			shareLinkButton.addEventListener("click", async () => {
				try {
					await navigator.clipboard.writeText(`${baseUrl}/?rid=${roomName}&pw=${password}`)
					const clipboardSuccess = document.getElementById("clipboard-success")

					clipboardSuccess.style.opacity = 1
					setTimeout(() => {
						clipboardSuccess.removeAttribute("style")
					}, 2000)
				} catch (error) {
					console.log("- Error Share Link Button : ", error)
				}
			})
			const cameraSpeakerContainer = document.getElementById("camera-speaker-container")
			cameraSpeakerContainer.appendChild(shareButton)

			const hangUpButton = document.getElementById("hang-up-button")
			// const hangUpButtonHeaderContainer = document.getElementById("hang-up-button-container")
			const leftCollection = document.getElementById("left-button-collection")
			// const userListButton = document.getElementById("user-list-button")
			const menuButton = document.getElementById("option-button")
			const raiseHandButton = document.getElementById("raise-hand-button")
			// if (hangUpButton && hangUpButtonHeaderContainer) {
			// 	hangUpButtonHeaderContainer.appendChild(hangUpButton)
			// }
			leftCollection.appendChild(raiseHandButton)
			leftCollection.appendChild(menuButton)
			leftCollection.appendChild(hangUpButton)

			// document.getElementById("raise-hand-button").remove()
			document.getElementById("cc-button").remove()
			document.getElementById("chat-button").remove()
			document.getElementById("user-list-button").remove()

			const optionContainer = document.getElementById("option-container")
			const settingButton = document.getElementById("setting-button") // Target setting button

			// Create Chat Element
			const chatElement = document.createElement("div")
			chatElement.classList.add("option-list")
			chatElement.id = "chat-button"
			chatElement.innerHTML = `
				<img src="/assets/icons/chat.svg" alt="caption-icon" id="chat-mobile">
				<div id="red-dot-chat" class="d-none red-dot"></div>
				<span id="chat-icons-title">${localStorage.getItem("language") == "en" ? "Chat" : "Pesan"}</span>
			`

			chatElement.addEventListener("click", (e) => {
				try {
					eventListenerCollection.changeChatButton()
				} catch (error) {
					console.log("- Error Chat Button : ", error)
					alert(error)
				}
			})

			// Create Chat Element
			const userListElement = document.createElement("div")
			userListElement.classList.add("option-list")
			userListElement.id = "user-list-button"
			userListElement.innerHTML = `
				<img src="/assets/icons/people.svg" alt="participants-icon" id="participants-mobile">
				<div id="red-dot-user-list" class="d-none red-dot"></div>
				<span id="participants-icons-title">${localStorage.getItem("language") == "en" ? "Pariticpants" : "Peserta"}</span>
			`

			userListElement.addEventListener("click", () => {
				try {
					eventListenerCollection.changeUserListButton()
				} catch (error) {
					console.log("- Error User List Button : ", error)
				}
			})

			// Create Caption Element
			const captionElement = document.createElement("div")
			captionElement.classList.add("option-list")
			captionElement.id = "cc-button"
			captionElement.innerHTML = `
				<img src="/assets/icons/cc.svg" alt="caption-icon" id="cc-mobile">
				<span id="caption-menu">${localStorage.getItem("language") == "en" ? "Caption" : "Caption"}</span>
			`

			captionElement.addEventListener("click", (e) => {
				try {
					e.stopPropagation()
					eventListenerCollection.changeCCButton()
				} catch (error) {
					console.log("- Error Screen Sharing Button : ", error)
				}
			})

			// Insert both elements before the setting button
			optionContainer.insertBefore(chatElement, settingButton)
			optionContainer.insertBefore(userListElement, settingButton)
			optionContainer.insertBefore(captionElement, settingButton)
		}
	} catch (error) {
		console.log("- Error Responsive : ", error)
	}
}

getResponsive()

const connectSocket = async () => {
	try {
		socket.connect()
		socket.emit(
			"joining-room",
			{ position: "room", token },
			async ({ userId, roomId, status, authority, rtpCapabilities, waitingList, username }) => {
				console.log(socket.id)
				try {
					if (status) {
						let filteredRtpCapabilities = { ...rtpCapabilities }
						filteredRtpCapabilities.headerExtensions = filteredRtpCapabilities.headerExtensions.filter(
							(ext) => ext.uri !== "urn:3gpp:video-orientation"
						)
						usersVariable.username = username
						usersVariable.userId = userId
						usersVariable.authority = authority
						if (authority == 3) {
							document.getElementById("mute-all-button").remove()
						}
						const devices = await navigator.mediaDevices.enumerateDevices()
						usersVariable.picture = picture

						mediasoupClientVariable.rtpCapabilities = filteredRtpCapabilities
						await mediasoupClientVariable.createDevice()
						await mediasoupClientVariable.setEncoding()
						await mediasoupClientVariable.getMyStream({
							faceRecognition,
							picture: `${baseUrl}/photo/${picture}.png`,
							userId,
							username,
						})
						// await mediasoupClientVariable.getMyStream({ faceRecognition, picture: `${window.location.origin}/photo/${picture}.png`, userId, username })
						await mediasoupClientVariable.getCameraOptions({ userId: userId })
						await mediasoupClientVariable.getMicOptions({ usersVariable })

						let audioTrack = mediasoupClientVariable.myStream.getAudioTracks()[0]
						let videoTrack = mediasoupClientVariable.myStream.getVideoTracks()[0]
						if (authority == 1 || authority == 2) {
							usersVariable.screenSharingPermission = true
						} else {
							usersVariable.screenSharingPermission = false
						}
						await usersVariable.addAllUser({
							userId,
							username,
							authority,
							socketId: socket.id,
							kind: "audio",
							track: audioTrack,
							focus: true,
							socket,
							appData: {
								label: "audio",
								isActive: true,
								kind: "audio",
								roomId: roomId,
								socketId: socket.id,
								userId,
								picture,
							},
						})
						await usersVariable.addAllUser({
							userId,
							username,
							authority,
							socketId: socket.id,
							kind: "video",
							track: videoTrack,
							focus: true,
							socket,
							appData: {
								label: "video",
								isActive: true,
								kind: "audio",
								roomId: roomId,
								socketId: socket.id,
								userId,
								picture,
							},
						})
						await usersVariable.startSpeechToText({ socket, status: true })
						if ((authority == 1 || authority == 2) && waitingList) {
							waitingList.forEach((u) => {
								eventListenerCollection.methodAddWaitingUser({ id: u.participantId, username: u.username, socket, picture: u.picture })
							})
						}
						await mediasoupClientVariable.createSendTransport({ socket, roomId, userId, usersVariable })
						// document.getElementById("loading-id").className = "loading-hide"
					} else {
						window.location.href = baseUrl
					}
				} catch (error) {
					console.log("- Error Join Room : ", error)
					this.constructor.warning({ message: `Internal Server Error!\n${error}`, back: true })
				}
			}
		)
	} catch (error) {
		console.log("- Error Connect Socket : ", error)
	}
}

if (faceRecognition) {
	Promise.all([
		// faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/plugins/face-api/models"),
		// faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/plugins/face-api/models"),
		// faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/plugins/face-api/models"),

		faceapi.nets.tinyFaceDetector.loadFromUri("../../assets/plugins/face-api/models"),
		faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/plugins/face-api/models"),
	]).then((_) => {
		// document.getElementById("loading-id").className = "loading-hide"
		connectSocket()
	})
} else {
	connectSocket()
}

socket.on("member-joining-room", ({ id, socketId, username, picture }) => {
	try {
		eventListenerCollection.methodAddWaitingUser({ id: id, username: username, socket, picture })
	} catch (error) {
		console.log("- Member Error Join Room : ", error)
	}
})

socket.on("cancel-waiting", ({ socketId, userId }) => {
	try {
		eventListenerCollection.deleteWaitingUser({ id: userId })
	} catch (error) {
		console.log("- Error Cancel : ", error)
	}
})

socket.on("user-list", async ({ type, userId, isActive }) => {
	try {
		const users = await usersVariable.allUsers.find((u) => u.userId == userId)
		users.consumer.forEach((c) => {
			if (c.appData.label == "audio") {
				console.log(c.track)
			}
		})
		console.log(users)
		mediasoupClientVariable.reverseConsumerTrack({ userId, isActive })
	} catch (error) {
		console.log("- Error On User List : ", error)
	}
})

socket.on("user-logout", ({ userId }) => {
	try {
		eventListenerCollection.methodAddRaiseHandUser({ id: userId, status: false })
		eventListenerCollection.deleteUserList({ id: userId })
		usersVariable.deleteVideoSecondMethod({ userId })
		usersVariable.deleteAudio({ userId })
		usersVariable.deleteAllUser({ userId })
		usersVariable.updateVideoSecondMethod({ socket })
	} catch (error) {
		console.log("- Error User Log Out : ", error)
	}
})

socket.on("message", async ({ userId, message, username, picture }) => {
	try {
		const messageDate = new Date()
		const formattedTime = messageDate.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		})
		const isSender = false
		if (!eventListenerCollection.chatStatus && !document.getElementById("new-message-line")) {
			const chatContent = document.getElementById("chat-content")
			const newMessageLine = document.createElement("div")
			newMessageLine.id = "new-message-line"
			newMessageLine.innerHTML = `<span>New Message</span>`
			chatContent.appendChild(newMessageLine)
			const redDotChat = document.getElementById("red-dot-chat")
			redDotChat.classList.remove("d-none")
		}
		const messageTemplate = await eventListenerCollection.messageTemplate({
			isSender,
			username: username,
			messageDate: formattedTime,
			message,
			picture,
		})
		await eventListenerCollection.appendMessage({ message: messageTemplate })
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

socket.on("new-producer", async ({ producerId, userId, socketId }) => {
	try {
		await mediasoupClientVariable.signalNewConsumerTransport({
			remoteProducerId: producerId,
			socket,
			userId,
			socketId,
			roomId: roomName,
			usersVariable: usersVariable,
		})
	} catch (error) {
		console.log("- Error SOCKET New Producer : ", error)
	}
})

socket.on("producer-closed", async ({ producerId }) => {
	try {
		console.log("- Producer Closed : ", producerId)
	} catch (error) {
		console.log("- Error Closing Producer : ", error)
	}
})

socket.on("close-consumer", async ({ consumerId, appData }) => {
	try {
		await mediasoupClientVariable.closeConsumer({ consumerId })
	} catch (error) {
		console.log("- Error Close Consumer : ", error)
	}
})

socket.on("producer-pause", async ({ pause, producerId, userId }) => {
	try {
		const userConsumer = mediasoupClientVariable.consumers.find((c) => c.consumer.producerId == producerId)
		if (!pause) {
			userConsumer.consumer.resume()
		}

		if (pause) {
			userConsumer.consumer.pause()
		}
	} catch (error) {
		console.log("- Error Producer Paused : ", error)
	}
})

socket.on("stop-screensharing", async ({ producerId, label }) => {
	try {
		if (label) {
			await mediasoupClientVariable.closeScreenSharing({ producerId })
			await usersVariable.closeConsumer({ label, userId: usersVariable.userId, consumerId: undefined, socket })
		}
	} catch (error) {
		console.log("- Error Stop Screen Sharing Video : ", error)
	}
})

socket.on("screensharing-permission", async ({ socketId, userId, to, type, response, username }) => {
	try {
		if (type == "request") {
			await usersVariable.screenSharingPermissionForAdmin({ socket, userId, socketId, roomId: eventListenerCollection.roomId, username })
		} else if (type == "response") {
			if (document.getElementById(`screensharing-permission-${usersVariable.userId}`)) {
				document.getElementById(`screensharing-permission-${usersVariable.userId}`).remove()
			}

			let message = response ? "Izin berbagi layar anda diterima oleh admin!" : "Izin berbagi layar anda ditolak oleh admin!"

			Users.warning({ message })
			usersVariable.screenSharingPermission = response
			usersVariable.screenSharingRequestPermission = false
		}
	} catch (error) {
		console.log("- Error Screen Sharing Permission : ", error)
	}
})

socket.on("force-stop-screensharing", async ({ message }) => {
	try {
		await Users.warning({ message })
		let screenSharingButton = document.getElementById("screen-sharing-button")
		await screenSharingButton.click()
	} catch (error) {
		console.log("- Error Force Stop Screen Sharing : ", error)
	}
})

socket.on("admin-response", async ({ type, id, roomId }) => {
	try {
		console.log("ADMIN RESPONSE : ", id)
		if (type == "waiting-list") {
			eventListenerCollection.removeWaitingList({ id })
		} else if (type == "screen-sharing-permission") {
			eventListenerCollection.removeScreenSharingPermissionUser({ id })
		}
	} catch (error) {
		console.log("- Error Admin Response : ", error)
	}
})

socket.on("new-user-notification", async ({ username, picture }) => {
	try {
		await eventListenerCollection.newUserNotification({ username, picture })
	} catch (error) {
		console.log
	}
})

socket.on("raise-hand", async ({ userId, username, picture, status }) => {
	try {
		await eventListenerCollection.methodAddRaiseHandUser({ id: userId, username, picture, status })
		if (status) {
			await eventListenerCollection.raiseHandNotification({ username })
		}
	} catch (error) {
		console.log("- Error Socket On Raise Hand : ", error)
	}
})

socket.on("transcribe", async ({ randomId, message, username, picture }) => {
	try {
		const ccDisplay = document.getElementById("cc-container")

		const ccContainer = document.createElement("div")
		ccContainer.className = "cc-content"
		ccContainer.id = `cc_${randomId}`
		const imageCC = document.createElement("img")
		imageCC.className = "cc-profile-picture"
		imageCC.src = `${baseUrl}/photo/${picture}.png`
		ccContainer.append(imageCC)
		const ccMessage = document.createElement("div")
		ccMessage.className = "cc-message"
		const ccUsername = document.createElement("div")
		ccUsername.className = "cc-username"
		const ccUsernameSpan = document.createElement("span")
		ccUsernameSpan.innerHTML = username
		ccUsername.append(ccUsernameSpan)
		ccMessage.append(ccUsername)
		const ccMessageContainer = document.createElement("div")
		ccMessageContainer.className = "cc-message-content"
		const ccMessageSpan = document.createElement("span")
		ccMessageSpan.id = `cc_message_${randomId}`
		ccMessageContainer.append(ccMessageSpan)
		ccMessage.append(ccMessageContainer)
		ccContainer.append(ccMessage)
		if (!document.getElementById(`cc_${randomId}`)) {
			ccDisplay.append(ccContainer)
		}

		document.getElementById(`cc_message_${randomId}`).textContent = message

		ccDisplay.scrollTop = ccDisplay.scrollHeight
	} catch (error) {
		console.log("- Error Transcribe : ", error)
	}
})

socket.on("mute-all", async ({ status }) => {
	try {
		const microphoneStatus = mediasoupClientVariable.audioProducer.paused
		if (status && !microphoneStatus) {
			await document.getElementById("mic-icon").click()
		}
		usersVariable.muteAllStatus = status
	} catch (error) {
		console.log("- Error Socket Mute All : ", error)
	}
})

socket.on("kick-user", async ({ message }) => {
	try {
		Users.warning({ message })
		setTimeout(() => {
			socket.emit("hang-up", { userid: usersVariable.userId }, ({ status }) => {
				socket.disconnect()
				window.location.href = baseUrl
			})
		}, 3000)
	} catch (error) {
		console.log("- Error Socket On Kick User : ", error)
	}
})

// Microphone Button
let microphoneButton = document.getElementById("mic-icon")
microphoneButton.addEventListener("click", async () => {
	try {
		if (usersVariable.muteAllStatus && usersVariable.authority == 3) {
			Users.warning({ message: "Microphone dikunci oleh Admin" })
			return
		}
		// const userId = usersVariable.userId
		// const isActive = await mediasoupClientVariable.reverseMicrophone({ userId })
		// await usersVariable.startSpeechToText({ socket, status: isActive })
		// const producerId = mediasoupClientVariable.audioProducer.id
		// socket.emit("producer-app-data", { isActive, producerId })
		// document.getElementById(`video-mic-${userId}`).src = isActive ? "/assets/icons/mic_level_0.svg" : "/assets/icons/mic_muted.svg"
		// usersVariable.allUsers.forEach((user) => {
		// 	if (user.userId != userId) {
		// 		socket.emit("user-list", { type: "mic", userId: userId, to: user.socketId, isActive })
		// 	}
		// })
		if (mediasoupClientVariable.audioProducer.paused) {
			socket.emit("producer-resume", { socketId: socket.id, producerId: mediasoupClientVariable.audioProducer.id }, async ({ status, message }) => {
				mediasoupClientVariable.audioProducer.resume()
			})
		} else {
			socket.emit("producer-pause", { socketId: socket.id, producerId: mediasoupClientVariable.audioProducer.id }, async ({ status, message }) => {
				mediasoupClientVariable.audioProducer.pause()
			})
		}
	} catch (error) {
		console.log("- Error Microphone Button : ", error)
	}
})

// Camera Button
let cameraButton = document.getElementById("camera-icon")
cameraButton.addEventListener("click", () => {
	try {
		// eventListenerCollection.changeCameraButton()
		// Users.warning({ message: "Kamera tidak boleh dimatikan!" })
		const videoProducerStatus = mediasoupClientVariable.videoProducer.paused

		if (videoProducerStatus) {
			if (os.toLocaleLowerCase() == "android" || os.toLocaleLowerCase() == "ios") {
				document.getElementById("switch-camera-mobile").classList.remove("d-none")
			}
			socket.emit("producer-resume", { socketId: socket.id, producerId: mediasoupClientVariable.videoProducer.id }, async ({ status, message }) => {
				mediasoupClientVariable.videoProducer.resume()
			})
		} else {

			if (os.toLocaleLowerCase() == "android" || os.toLocaleLowerCase() == "ios") {
				document.getElementById("switch-camera-mobile").classList.add("d-none")
			}
			socket.emit("producer-pause", { socketId: socket.id, producerId: mediasoupClientVariable.videoProducer.id }, async ({ status, message }) => {
				mediasoupClientVariable.videoProducer.pause()
			})
		}
	} catch (error) {
		console.log("- Error Camera Button : ", error)
	}
})

let switchCameraHandphone = document.getElementById("switch-camera-mobile")
switchCameraHandphone.addEventListener("click", async () => {
	try {
		await mediasoupClientVariable.switchCameraHandphone({ userId: usersVariable.userId })
	} catch (error) {
		alert(error)
	}
})

// User List Button
let userListButton = document.getElementById("user-list-button")
userListButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeUserListButton()
	} catch (error) {
		console.log("- Error User List Button : ", error)
	}
})

// Chat Button
let chatButton = document.getElementById("chat-button")
chatButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeChatButton()
	} catch (error) {
		console.log("- Error Chat Button : ", error)
	}
})

// Raise Hand Button
let raiseHandButton = document.getElementById("raise-hand-button")
raiseHandButton.addEventListener("click", async (e) => {
	try {
		e.stopPropagation()
		const raiseHandStatus = await eventListenerCollection.changeRaiseHandButton()
		await eventListenerCollection.methodAddRaiseHandUser({
			id: usersVariable.userId,
			socket,
			picture: usersVariable.picture,
			username: usersVariable.username,
			status: raiseHandStatus,
		})

		usersVariable.allUsers.forEach((u) => {
			if (u.userId != usersVariable.userId) {
				socket.emit("raise-hand", {
					to: u.socketId,
					userId: usersVariable.userId,
					username: usersVariable.username,
					picture: usersVariable.picture,
					status: raiseHandStatus,
				})
			}
		})
	} catch (error) {
		console.log("- Error Raise Hand Button : ", error)
	}
})

// Screen Sharing Button
let screenSharingButton = document.getElementById("screen-sharing-button")
screenSharingButton.addEventListener("click", async () => {
	try {
		if (usersVariable.screenSharingMode && usersVariable.userIdScreenSharing != usersVariable.userId && usersVariable.userIdScreenSharing != "") {
			Users.warning({ message: "Berbagi layar sedang berjalan" })
			return
		}

		if (usersVariable.screenSharingRequestPermission) {
			Users.warning({ message: "Sudah minta izin berbagi layar ke admin" })
			return
		}

		if (!usersVariable.screenSharingPermission) {
			await usersVariable.screenSharingPermissionForUser({ socket })
			return
		}

		const screenSharingStatus = await mediasoupClientVariable.changeScreenSharingButton({ socket })
		if (screenSharingStatus) {
			const videoTrack = await screenSharingStatus.getVideoTracks()[0]
			await usersVariable.addAllUser({
				userId: usersVariable.userId,
				authority: usersVariable.authority,
				username: "Screen Sharing",
				socketId: socket.id,
				kind: "video",
				track: videoTrack,
				focus: true,
				socket,
				appData: {
					label: "screensharing_video",
					isActive: true,
					kind: "video",
					roomId: roomName,
					socketId: socket.id,
					userId: usersVariable.userId,
					picture: usersVariable.picture,
				},
			})
			await usersVariable.changeScreenSharingMode({
				status: true,
				userId: usersVariable.userId,
				socket,
				username: usersVariable.username,
				picture: usersVariable.picture,
			})
		}
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

// CC Button
let ccButton = document.getElementById("cc-button")
ccButton.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		eventListenerCollection.changeCCButton()
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

// Option Button
let optionButton = document.getElementById("option-button")
let closeOptionButton = document.getElementById("close-button-option-list")
closeOptionButton.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		eventListenerCollection.changeOptionButton()
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

optionButton.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		eventListenerCollection.changeOptionButton()
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

// Mute All
let muteAllButton = document.getElementById("mute-all-button")
muteAllButton?.addEventListener("click", async () => {
	try {
		const muteAllStatus = await eventListenerCollection.changeMuteAllButton()
		usersVariable.muteAllStatus = muteAllStatus
		usersVariable.allUsers.forEach((u) => {
			if (u.socketId != socket.id) {
				socket.emit("mute-all", { to: u.socketId, status: muteAllStatus })
			}
		})
	} catch (error) {
		console.log("- Error Mute All : ", error)
	}
})

// Video Layout
let videoLayoutButton = document.getElementById("video-layout-button")
videoLayoutButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeVideoLayout()
	} catch (error) {
		console.log("- Error Show Video Layout : ", error)
	}
})

// Record Button
let recordButton = document.getElementById("record-button")
recordButton.addEventListener("click", () => {
	try {
		usersVariable.recordMeeting({ from: false, RecordRTC })
	} catch (error) {
		console.log("- Error Record : ", error)
	}
})

// let pauseRecord = document.getElementById("pause-record")
// pauseRecord.addEventListener("click", () => {
// 	try {
// 		eventListenerCollection.pauseRecord()
// 	} catch (error) {
// 		console.log("- Error Pause Record : ", error)
// 	}
// })

let resumeRecord = document.getElementById("resume-record")
resumeRecord.addEventListener("click", () => {
	try {
		eventListenerCollection.resumeRecord()
	} catch (error) {
		console.log("- Error Resume Record : ", error)
	}
})

let stopRecord = document.getElementById("stop-record")
stopRecord.addEventListener("click", () => {
	try {
		usersVariable.recordMeeting({ from: true, RecordRTC })
	} catch (error) {
		console.log("- Error Stop Record : ", error)
	}
})

let videoLayoutCloseButton = document.getElementById("close-button-layout")
videoLayoutCloseButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeVideoLayout()
	} catch (error) {
		console.log("- Error Show Video Layout : ", error)
	}
})

let layoutVideoOptions = document.querySelectorAll(".layout-option-container")
layoutVideoOptions.forEach((container) => {
	try {
		container.addEventListener("click", (e) => {
			try {
				e.stopPropagation()
				usersVariable.selectVideoLayout({ container, socket })
			} catch (error) {
				console.log("- Error Select Video Layout : ", error)
			}
		})
	} catch (error) {
		console.log("- Error Looping Select Video Layout : ", error)
	}
})

let layoutCount = document.querySelectorAll(".layout-option")
layoutCount.forEach((container) => {
	try {
		container.addEventListener("click", (e) => {
			e.stopPropagation()
			try {
				usersVariable.selectLayoutCount({ container, socket })
			} catch (error) {
				console.log("- Error Select Video Layout : ", error)
			}
		})
	} catch (error) {
		console.log("- Error Looping Select Video Layout : ", error)
	}
})

let previousButton = document.getElementById("previous-page")
previousButton.addEventListener("click", () => {
	try {
		usersVariable.previousVideo({ socket })
	} catch (error) {
		console.log("- Error Click Previous Button : ", error)
	}
})
let nextButton = document.getElementById("next-page")
nextButton.addEventListener("click", () => {
	try {
		usersVariable.nextVideo({ socket })
	} catch (error) {
		console.log("- Error Click Next Button : ", error)
	}
})

let upButton = document.getElementById("arrow-up")
upButton.addEventListener("click", () => {
	try {
		usersVariable.previousVideo({ socket })
	} catch (error) {
		console.log("- Error Up Button Video : ", error)
	}
})
let downButton = document.getElementById("arrow-down")
downButton.addEventListener("click", () => {
	try {
		usersVariable.nextVideo({ socket })
	} catch (error) {
		console.log("- Error Down Button Video : ", error)
	}
})

let microphoneDevicesOption = document.getElementById("microphone-devices-option")
microphoneDevicesOption.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		eventListenerCollection.microphoneDevicesOption()
	} catch (error) {
		console.log("- Error Microphone Devices Option : ", error)
	}
})

let videoDevicesOption = document.getElementById("camera-devices-option")
videoDevicesOption.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		eventListenerCollection.cameraDevicesOption()
	} catch (error) {
		console.log("- Error Video Devices Option : ", error)
	}
})

const messageInput = document.getElementById("message-input")
messageInput.addEventListener("keyup", async (event) => {
	try {
		if (event.key === "Enter" && messageInput.value && messageInput.value.trim() !== "") {
			const username = usersVariable.userId
			const messageDate = new Date()
			const formattedTime = messageDate.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			})

			const message = messageInput.value

			if (message.trim() == "" || !message) {
				return
			}

			const userId = usersVariable.userId
			usersVariable.allUsers.forEach((user) => {
				if (user.userId != userId) {
					socket.emit("message", {
						userId: user.userId,
						to: user.socketId,
						message,
						username: usersVariable.username,
						picture: usersVariable.picture,
					})
				}
			})

			const isSender = true
			const messageTemplate = await eventListenerCollection.messageTemplate({
				isSender,
				username: usersVariable.username,
				messageDate: formattedTime,
				message,
				picture: usersVariable.picture,
			})
			await eventListenerCollection.appendMessage({ message: messageTemplate })
			let chatContent = document.getElementById("chat-content")
			chatContent.scrollTop = chatContent.scrollHeight
			messageInput.value = ""
			const response = await fetch(`${baseUrl}/api/video_conference/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${userToken}`,
				},
				body: JSON.stringify({ participant_id: usersVariable.userId, message_text: message, sent_at: new Date(), status: 1, room_id: roomName }),
			})
			console.log(response)
		}
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

const sendMessageButton = document.getElementById("send-message-button")
sendMessageButton.addEventListener("click", async (event) => {
	try {
		const username = usersVariable.userId
		const messageDate = new Date()
		const formattedTime = messageDate.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		})

		const message = messageInput.value
		if (message.trim() == "" || !message) {
			return
		}

		const userId = usersVariable.userId
		usersVariable.allUsers.forEach((user) => {
			if (user.userId != userId) {
				socket.emit("message", {
					userId: user.userId,
					to: user.socketId,
					message,
					username: usersVariable.username,
					picture: usersVariable.picture,
				})
			}
		})

		const isSender = true
		const messageTemplate = await eventListenerCollection.messageTemplate({
			isSender,
			username: usersVariable.username,
			messageDate: formattedTime,
			message,
			picture: usersVariable.picture,
		})
		await eventListenerCollection.appendMessage({ message: messageTemplate })
		let chatContent = document.getElementById("chat-content")
		chatContent.scrollTop = chatContent.scrollHeight
		messageInput.value = ""
		const response = await fetch(`${baseUrl}/api/video_conference/message`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${userToken}`,
			},
			body: JSON.stringify({ participant_id: usersVariable.userId, message_text: message, sent_at: new Date(), status: 1, room_id: roomName }),
		})
	} catch (error) {
		console.log("- Error Send Mesage : ", error)
	}
})

const hangUpButton = document.getElementById("hang-up-button")
hangUpButton.addEventListener("click", async () => {
	try {
		socket.emit("hang-up", { userid: usersVariable.userId }, ({ status }) => {
			socket.disconnect()
			window.location.href = `${baseUrl}`
		})
	} catch (error) {
		console.log("- Error Hang Up Button : ", error)
	}
})

const closeSideBarContainer = document.getElementById("close-side-bar")
const closeSideBarContainer2 = document.getElementById("close-side-bar-chat")
closeSideBarContainer2.addEventListener("click", () => {
	try {
		eventListenerCollection.changeChatButton()
	} catch (error) {
		console.log("- Error Close Side Bar Container 2 : ", error)
	}
})
closeSideBarContainer.addEventListener("click", () => {
	try {
		eventListenerCollection.changeUserListButton()
	} catch (error) {
		console.log("- Error Side Bar Container : ", error)
	}
})

const layoutModalContainer = document.getElementById("layout-modal")
layoutModalContainer.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
	} catch (error) {
		console.log("- Error Modal Layout : ", error)
	}
})

const videoQualityContainer = document.getElementById("video-quality-container")
videoQualityContainer.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
	} catch (error) {
		console.log("- Error Close Video Quality Container : ", error)
	}
})

const videoQualityCButton = document.getElementById("video-quality-button")
videoQualityCButton.addEventListener("click", (e) => {
	try {
		eventListenerCollection.openVideoQualityContainer()
	} catch (error) {
		console.log("- Error Video Quality Container : ", error)
	}
})

let upstreamOption = document.querySelectorAll(".upstream-option")
upstreamOption.forEach((container) => {
	try {
		container.addEventListener("click", async (e) => {
			e.stopPropagation()
			try {
				const upStream = await eventListenerCollection.selectUpstream({ container })
				const inputStringToNumber = Number(upStream)
				await mediasoupClientVariable.videoProducer.setMaxSpatialLayer(inputStringToNumber)
			} catch (error) {
				console.log("- Error Select Video Layout : ", error)
			}
		})
	} catch (error) {
		console.log("- Error Looping Select Video Layout : ", error)
	}
})

let downstreamOption = document.querySelectorAll(".downstream-option")
downstreamOption.forEach((container) => {
	try {
		container.addEventListener("click", async (e) => {
			e.stopPropagation()
			try {
				const downStream = await eventListenerCollection.selectDownstream({ container })
				usersVariable.allUsers.forEach((u) => {
					if (u.userId != usersVariable.userId) {
						u.consumer.forEach((c) => {
							if (c.kind == "video") {
								socket.emit("set-consumer-quality", {
									consumerId: c.id,
									SL: videoType == "vp8" ? 1 : Number(downStream),
									TL: videoType == "vp8" ? Number(downStream) : 2,
								})
							}
						})
					}
				})
			} catch (error) {
				console.log("- Error Select Video Layout : ", error)
			}
		})
	} catch (error) {
		console.log("- Error Looping Select Video Layout : ", error)
	}
})

const searchParticipant = document.getElementById("search-participant")
searchParticipant.addEventListener("input", (event) => {
	const userListItems = document.querySelectorAll("#users-list-container .user-list-content")
	const searchTerm = event.target.value.toLowerCase()

	userListItems.forEach((item) => {
		const username = item.querySelector(".user-list-username").textContent.toLowerCase() // Get the username and convert it to lowercase

		if (username.includes(searchTerm)) {
			item.classList.remove("d-none")
		} else {
			if (!item.classList.contains("d-none")) {
				item.classList.add("d-none")
			}
		}
		if (searchTerm == "") {
			item.classList.remove("d-none")
		}
	})
})

const shareLinkButton = document.getElementById("share-link-button")

shareLinkButton.addEventListener("click", async () => {
	try {
		await navigator.clipboard.writeText(`${baseUrl}/?rid=${roomName}&pw=${password}`)
		const clipboardSuccess = document.getElementById("clipboard-success")

		clipboardSuccess.style.opacity = 1
		setTimeout(() => {
			clipboardSuccess.removeAttribute("style")
		}, 2000)
	} catch (error) {
		console.log("- Error Share Link Button : ", error)
	}
})

// Click Oustide Container
document.addEventListener("click", function (e) {
	try {
		e.stopPropagation()
		eventListenerCollection.hideButton()
		eventListenerCollection.hideUserOptionButton()
		eventListenerCollection.closeVideoLayout()
		eventListenerCollection.closeVideoQualityContainer()
	} catch (error) {
		console.log("- Error HideAll Button : ", error)
	}
})

window.addEventListener("beforeunload", function (event) {
	try {
		if (usersVariable.record.recordedStream) {
			usersVariable.record.recordedMedia.stopRecording(() => {
				// socket.send({ type: 'uploading' })
				usersVariable.record.isRecording = false
				let blob = usersVariable.record.recordedMedia.getBlob()

				// require('recordrtc').getSeekableBlob(recordedMediaRef.current.getBlob(), (seekable) => {
				//     console.log("- SeekableBlob : ", seekable)
				//     downloadRTC(seekable)
				// })
				// downloadRTC(blob)
				const currentDate = new Date()
				const formattedDate = currentDate
					.toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})
					.replace(/\//g, "") // Remove slashes from the formatted date

				const file = new File([blob], formattedDate, {
					type: "video/mp4",
				})
				require("recordrtc").invokeSaveAsDialog(file, file.name)
				usersVariable.record.recordedStream.getTracks().forEach((track) => track.stop())
				usersVariable.record.recordedStream = null
				usersVariable.record.recordedMedia.reset()
				usersVariable.record.recordedMedia = null
				usersVariable.timer()
			})
			let confirmationMessage = "Anda yakin ingin menutup tab ini?"
			// (Standar) For modern browsers
			event.returnValue = confirmationMessage

			// (IE) For Internet Explorer
			return confirmationMessage
		}
		// window.location.href = window.location.origin
		// socket.close()
	} catch (error) {}
})

// const pauseVideo = document.getElementById("pause-video")
// let isVideoPaused = false
// pauseVideo.addEventListener("click", () => {
// 	try {
// 		if (isVideoPaused) {
// 			isVideoPaused = false
// 			usersVariable.allUsers.forEach((u) => {
// 				u.consumer.forEach((c) => {
// 					if (c.id && c.appData.label == "video") {
// 						socket.emit("consumer-resume", { serverConsumerId: c.id })
// 					}
// 				})
// 			})
// 		} else {
// 			isVideoPaused = true
// 			usersVariable.allUsers.forEach((u) => {
// 				u.consumer.forEach((c) => {
// 					if (c.id && c.appData.label == "video") {
// 						socket.emit("consumer-pause", { serverConsumerId: c.id })
// 					}
// 				})
// 			})
// 		}
// 	} catch (error) {
// 		console.log("- Error Pause Video : ", error)
// 	}
// })

if (os.toLowerCase() == "android" || os.toLowerCase() == "ios") {
	let touchStartVideoCollection = 0
	let touchEndVideoCollection = 0

	const videoCollection = document.getElementById("video-collection")

	// Detect touch start
	videoCollection.addEventListener("touchstart", (e) => {
		try {
			touchStartVideoCollection = e.touches[0].clientX
		} catch (error) {
			console.log("- Errpr Catch Touch Start Video Collection : ", error)
		}
	})

	// Detect touch end
	videoCollection.addEventListener("touchend", (e) => {
		try {
			touchEndVideoCollection = e.changedTouches[0].clientX
			handleSwipeVideoCollection()
		} catch (error) {
			console.log("- Error Catch Touch End Video Collection : ", error)
		}
	})

	const handleSwipeVideoCollection = () => {
		try {
			const swipeDistance = touchEndVideoCollection - touchStartVideoCollection

			// Swipe Left
			if (usersVariable.currentPage == 1 && swipeDistance > 100 && usersVariable.currentLayout == 2) {
				usersVariable.updateVideoSecondMethodHandphone({ socket, focus: true })
				return
			}

			if (swipeDistance > 100) {
				usersVariable.previousVideo({ socket })
			} else if (swipeDistance < -100) {
				usersVariable.nextVideo({ socket })
			}
		} catch (error) {
			console.log("- Error Handling Swipe : ", error)
		}
	}

	let touchStartVideoFocus = 0
	let touchEndVideoFocus = 0

	const videoFocus = document.getElementById("video-container-focus")

	// Detect touch start
	videoFocus.addEventListener("touchstart", (e) => {
		try {
			touchStartVideoFocus = e.touches[0].clientX
		} catch (error) {
			console.log("- Errpr Catch Touch Start Video Collection : ", error)
		}
	})

	// Detect touch end
	videoFocus.addEventListener("touchend", (e) => {
		try {
			touchEndVideoFocus = e.changedTouches[0].clientX
			handleSwipeVideoFocus()
		} catch (error) {
			console.log("- Error Catch Touch End Video Collection : ", error)
		}
	})

	const handleSwipeVideoFocus = () => {
		try {
			const swipeDistance = touchEndVideoFocus - touchStartVideoFocus
			if (swipeDistance < -100) {
				usersVariable.updateVideoSecondMethodHandphone({ socket, focus: false })
			}
		} catch (error) {
			console.log("- Error Handling Swipe : ", error)
		}
	}

	let audioContext = new (window.AudioContext || window.webkitAudioContext)()
	let gainNode = audioContext.createGain()
	gainNode.gain.value = 1 // Default volume

	const muteSpeakerButton = document.getElementById("mute-speaker-mobile")
	const muteIcon = muteSpeakerButton.querySelector("img")

	muteSpeakerButton.addEventListener("click", () => {
		try {
			if (muteIcon.src.includes("mute_speaker_mobile.svg")) {
				muteIcon.src = "/assets/icons/muted_speaker_mobile.svg"
				gainNode.gain.value = 0
			} else {
				muteIcon.src = "/assets/icons/mute_speaker_mobile.svg"
				gainNode.gain.value = 1
			}
		} catch (error) {
			console.log("- Error Mute Speaker:", error)
		}
	})
}
