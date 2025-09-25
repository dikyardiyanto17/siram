const { default: Swal } = require("sweetalert2")
const { getSocket } = require("../socket/socket")
const { EventListener } = require("./eventListener")
const { Users } = require("./user")
const { MediaSoupClient } = require("./mediasoupClient")
const url = window.location.pathname
const parts = url.split("/")
const RecordRTC = require("recordrtc")
const { DBMeeting } = require("../helper/db")
const { Helpers } = require("../../../helper")
const socket = getSocket(socketBaseUrl, socketPath)

let meetingInfo = {
	roomName: "",
	userId: "",
	token: "",
	roomId: "",
	password: "",
	username: "",
	meetingType: 0,
}

let faceRecognition = false
let videoType = "vp8"
let userToken = "usertoken"

// contoh data
// {
//     "_id": "68bfa56f712356e8a93f8bd7",
//     "userId": "c281ae87-5cdf-4017-a933-2ba32b7e8f1c",
//     "username": "Diky Ardiyant",
//     "fullname": "Diky Ardiyant",
//     "authProvider": "guest",
//     "confirmed": false,
//     "createdAt": "2025-09-09T03:56:31.300Z",
//     "updatedAt": "2025-09-09T03:56:31.300Z",
//     "__v": 0,
//     "roomId": "klmt-hYGF-kgWR",
//     "roomPassword": "TUdc-l4vm-TvMt",
//     "sourceMeeting": "Instant",
//     "startMeeting": "2025-09-09T03:56:31.294Z",
//     "link": "https://localhost:9102/vmeet/?rid=TUdc-l4vm-TvMt&pw=TUdc-l4vm-TvMt",
//     "participants": [],
//     "enableWaitingRoom": false,
//     "enableSharingScreen": false,
//     "createdBy": "68bfa56f712356e8a93f8bd3",
//     "title": "d64a95c4-d866-4d90-9dd8-ea6a3bec38eb",
//     "userIds": "68bfa56f712356e8a93f8bd3"
// }

const db = new DBMeeting()
db.init()

let eventListenerCollection
const usersVariable = new Users()
const mediasoupClientVariable = new MediaSoupClient()
const isViewer = JSON.parse(localStorage.getItem("isViewer"))
const isCameraActive = JSON.parse(localStorage.getItem("isCameraActive"))
const isMicActive = JSON.parse(localStorage.getItem("isMicActive"))
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

const getViewerFeature = () => {
	try {
		const videoQualityUpstream = document.getElementById("video-quality-upstream")
		const muteAllButton = document.getElementById("mute-all-button")
		const micButton = document.getElementById("mic-button")
		const cameraButton = document.getElementById("camera-button")
		const recordContainer = document.getElementById("record-container")
		const screenSharingButton = document.getElementById("screen-sharing-button")
		const recordButton = document.getElementById("record-button")
		videoQualityUpstream.remove()
		muteAllButton.remove()
		micButton.remove()
		cameraButton.remove()
		recordContainer.remove()
		screenSharingButton.remove()
		recordButton.remove()
	} catch (error) {
		console.log("- error get viewer feature : ", error)
	}
}

const os = getOS()

mediasoupClientVariable.os = os
usersVariable.os = os

const getResponsive = async () => {
	try {
		const os = await getOS()
		if (os == "Android" || os == "iOS") {
			const shareButton = document.getElementById("share-link-button")
			shareLinkButton.addEventListener("click", async () => {
				try {
					await navigator.clipboard.writeText(`${baseUrl}/?rid=${meetingInfo.roomId}&pw=${meetingInfo.password}`)
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
				<img src="${baseUrl}/assets/icons/chat.svg" alt="caption-icon" id="chat-mobile">
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
				<img src="${baseUrl}/assets/icons/people.svg" alt="participants-icon" id="participants-mobile">
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
				<img src="${baseUrl}/assets/icons/cc.svg" alt="caption-icon" id="cc-mobile">
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

const connectSocket = async () => {
	try {
		mediasoupClientVariable.isViewer = isViewer
		mediasoupClientVariable.audioPrams.appData.isActive = isMicActive
		mediasoupClientVariable.videoParams.appData.isActive = isCameraActive
		await socket.connect()

		socket.emit(
			"joining-room",
			{
				userId: meetingInfo.userId,
				roomId: meetingInfo.roomId,
				isViewer,
				password: meetingInfo.password,
				token: await db.getCookie("roomToken"),
				username: meetingInfo.username,
				meetingType: meetingInfo.meetingType,
			},
			async (data) => {
				const { userId, roomId, status, authority, rtpCapabilities, waitingList, username, isViewer, meeting_type } = data
				if (status) {
					let filteredRtpCapabilities = { ...rtpCapabilities }
					filteredRtpCapabilities.headerExtensions = filteredRtpCapabilities.headerExtensions.filter(
						(ext) => ext.uri !== "urn:3gpp:video-orientation"
					)
					usersVariable.username = username
					usersVariable.userId = userId
					usersVariable.authority = authority
					if (authority == 1 && meeting_type == 1) {
						mediasoupClientVariable.lockRoom = true
						const lockIcon = document.getElementById("check-lock-room")
						lockIcon.classList.remove("d-none")
					}
					if (authority == 3) {
						document.getElementById("mute-all-button").remove()
						document.getElementById("lock-room-button").remove()
					}
					const devices = await navigator.mediaDevices.enumerateDevices()
					usersVariable.picture = picture
					mediasoupClientVariable.rtpCapabilities = filteredRtpCapabilities
					await mediasoupClientVariable.createDevice()
					await mediasoupClientVariable.setEncoding({ videoType: videoType })

					if (mediasoupClientVariable.isViewer) {
						usersVariable.users = 0
						await usersVariable.addAllUser({
							userId,
							username,
							authority,
							socketId: socket.id,
							kind: "audio",
							track: null,
							focus: false,
							socket,
							isViewer,
							appData: {
								label: "audio",
								isActive: false,
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
							track: null,
							focus: false,
							socket,
							isViewer,
							appData: {
								label: "video",
								isActive: false,
								kind: "audio",
								roomId: roomId,
								socketId: socket.id,
								userId,
								picture,
							},
						})
						await mediasoupClientVariable.createConsumerTransport({ socket, roomId, userId })
						await mediasoupClientVariable.getProducers({ socket, roomId, userId, usersVariable })
						document.getElementById("loading-id").className = "loading-hide"
						socket.emit("viewer-joined", { roomId: roomId, id: userId, username })
						return
					}

					const { hasCamera, hasMicrophone } = await mediasoupClientVariable.checkMediaDevices()

					await mediasoupClientVariable.getMyStream({
						faceRecognition,
						picture: `${baseUrl}/photo/${picture}.png`,
						userId,
						username,
					})

					if (mediasoupClientVariable.availableDevices.camera) {
						await mediasoupClientVariable.getCameraOptions({ userId: userId })
					}
					if (mediasoupClientVariable.availableDevices.microphone) {
						await mediasoupClientVariable.getMicOptions({ usersVariable })
					}

					mediasoupClientVariable.myStream.getAudioTracks()[0].enabled = isMicActive

					let audioTrack = mediasoupClientVariable.myStream.getAudioTracks()[0]
					let videoTrack = mediasoupClientVariable.myStream.getVideoTracks()[0] ? mediasoupClientVariable.myStream.getVideoTracks()[0] : null
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
						isViewer,
						appData: {
							label: "audio",
							isActive: mediasoupClientVariable.audioPrams.appData.isActive,
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
						isViewer,
						appData: {
							label: "video",
							isActive: mediasoupClientVariable.videoParams.appData.isActive,
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
				}
			}
		)
	} catch (error) {
		console.log("- Error Connect Socket : ", error)
	}
}

db.detail()
	.then((response) => {
		if (response.status) {
			const { title, roomId, userIds, roomPassword, username, enableWaitingRoom, allMessages } = response.data[0]

			meetingInfo.roomName = title ? title : roomId
			meetingInfo.userId = userIds
			meetingInfo.password = roomPassword
			meetingInfo.roomId = roomId
			meetingInfo.username = username
			meetingInfo.meetingType = enableWaitingRoom ? 1 : 2

			eventListenerCollection = new EventListener({
				micStatus: false,
				cameraStatus: false,
				roomId: meetingInfo.roomId,
			})

			return { allMessages, userIds }
		}

		throw { name: "Bad Request", message: response?.data[0]?.message }
	})
	.then(async ({ allMessages, userIds }) => {
		for (const msg of allMessages) {
			const randomId = await Helpers.generateRandomId(20, "-", 3)
			const language = localStorage.getItem("language") === "en"

			if (msg.isPrivate) {
				const isSender = msg.from === userIds
				const chatTo = isSender ? msg.to : msg.from

				let chatToUsername
				if (!msg.to) {
					chatToUsername = language ? "Everyone" : "Semua"
				} else {
					chatToUsername = isSender ? msg.toUser?.username || msg.username : msg.fromUser?.username || msg.username
				}

				const chatElement = document.getElementById(`chat-${chatTo}`)
				if (!chatElement) {
					await Users.createChat({
						id: chatTo,
						username: chatToUsername,
						createChatContainer: true,
						createChatTo: false,
					})
				}

				const messageTemplate = await eventListenerCollection.messageTemplate({
					isSender,
					username: chatToUsername,
					messageDate: new Date(msg.messageDate).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
					message: msg.type === "message" ? { content: msg.content } : { fileName: msg.fileName, fileSize: msg.fileSize },
					picture: msg.picture || usersVariable.picture || "P_0000000",
					type: msg.type,
					id: randomId,
					userId: userIds,
					chatTo,
				})

				await eventListenerCollection.appendMessage({ message: messageTemplate, chatTo })

				if (msg.type != "message") {
					await eventListenerCollection.donwloadFileMessage({ id: randomId, api: msg.api, type: msg.type })
				}

				// Generating message template in public for private message because id is can be duplicated
				const randomId2 = await Helpers.generateRandomId(20, "-", 3)
				const messageTemplatePublic = await eventListenerCollection.messageTemplate({
					isSender,
					username: chatToUsername,
					messageDate: new Date(msg.messageDate).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
					message: msg.type === "message" ? { content: msg.content } : { fileName: msg.fileName, fileSize: msg.fileSize },
					picture: msg.picture || usersVariable.picture || "P_0000000",
					type: msg.type,
					id: randomId2,
					userId: userIds,
					chatTo,
				})

				await eventListenerCollection.appendMessage({ message: messageTemplatePublic, chatTo: "everyone" })
				if (msg.type != "message") {
					await eventListenerCollection.donwloadFileMessage({ id: randomId2, api: msg.api, type: msg.type })
				}
			} else {
				const messageTemplate = await eventListenerCollection.messageTemplate({
					isSender: msg.from === userIds,
					username: msg.username,
					messageDate: new Date(msg.messageDate).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					}),
					message: msg.type === "message" ? { content: msg.content } : { fileName: msg.fileName, fileSize: msg.fileSize },
					picture: msg.picture || usersVariable.picture || "P_0000000",
					type: msg.type,
					id: randomId,
					userId: userIds,
				})

				await eventListenerCollection.appendMessage({ message: messageTemplate, chatTo: "everyone" })
				if (msg.type != "message") {
					await eventListenerCollection.donwloadFileMessage({ id: randomId, api: msg.api, type: msg.type })
				}
			}
		}

		return
	})

	.then(() => getResponsive())
	.then(() => connectSocket())
	.catch((error) => {
		Users.warning({
			message: error?.message || "Failed initializing DB",
		})
	})

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

socket.on("viewer-joined-feedback", async ({ id, socketId, username }) => {
	try {
		await Users.methodAddViewerList({ id, username })
		if (socketId != socket.id && mediasoupClientVariable.isViewer) {
			await socket.emit("viewer-joined-feedback", { id: usersVariable.userId, username: usersVariable.username, socketId })
		}
	} catch (error) {
		console.log("- Error viewer joined feedback : ", error)
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

socket.on("message", async ({ userId, message, username, picture, type, id, chatTo, resend }) => {
	try {
		const messageDate = new Date()
		const formattedTime = messageDate.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		})
		const isSender = false
		if (!eventListenerCollection.chatStatus && !document.getElementById("new-message-line")) {
			const chatContent = document.getElementById(`chat-${chatTo}`)
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
			message: message,
			picture,
			type,
			id: id,
			chatTo,
			userId: usersVariable.userId,
			resend
		})
		await eventListenerCollection.appendMessage({ message: messageTemplate, chatTo })
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

socket.on("message-donwload-link", async ({ userId, to, id, api, status, type }) => {
	try {
		await eventListenerCollection.donwloadFileMessage({ id, api, status, type })
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

socket.on("new-producer", async ({ producerId, userId, socketId, producerPaused }) => {
	try {
		await mediasoupClientVariable.signalNewConsumerTransport({
			remoteProducerId: producerId,
			socket,
			userId,
			socketId,
			roomId: meetingInfo.roomId,
			usersVariable: usersVariable,
			producerPaused,
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
		if (!mediasoupClientVariable.availableDevices.microphone) {
			Users.warning({ message: "Microphone tidak tersedia" })
			return
		}
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
cameraButton.addEventListener("click", async (e) => {
	try {
		// eventListenerCollection.changeCameraButton()
		// Users.warning({ message: "Kamera tidak boleh dimatikan!" })
		if (!mediasoupClientVariable.availableDevices.camera) {
			Users.warning({ message: "Camera tidak tersedia" })
			return
		}

		if (!mediasoupClientVariable.videoProducer) {
			mediasoupClientVariable.videoParams.appData.isActive = true
			await mediasoupClientVariable.getMyStream({ faceRecognition, picture, userId: usersVariable.userId, username: usersVariable.username })
			await mediasoupClientVariable.connectSendTransport({ socket, picture, userId: usersVariable.userId })
			await usersVariable.addVideoSecondMethod({
				userId: usersVariable.userId,
				track: mediasoupClientVariable.myStream.getVideoTracks()[0],
				username: usersVariable.username,
				picture: picture,
				isActive: true,
			})
			MediaSoupClient.changeVideo({ userId: usersVariable.userId, isActive: true, isCurrentUser: true })
			return
		}

		const videoProducerStatus = mediasoupClientVariable.videoProducer.paused

		if (videoProducerStatus) {
			await mediasoupClientVariable.turnOnCamera({ userId: usersVariable.userId })
			if (os.toLocaleLowerCase() == "android" || os.toLocaleLowerCase() == "ios") {
				document.getElementById("switch-camera-mobile").classList.remove("d-none")
			}
			socket.emit("producer-resume", { socketId: socket.id, producerId: mediasoupClientVariable.videoProducer.id }, async ({ status, message }) => {
				mediasoupClientVariable.videoProducer.resume()
			})
		} else {
			await mediasoupClientVariable.myStream.getVideoTracks()[0].stop()
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
				isViewer: false,
				appData: {
					label: "screensharing_video",
					isActive: true,
					kind: "video",
					roomId: meetingInfo.roomId,
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

// Lock Room
let lockRoomButton = document.getElementById("lock-room-button")
lockRoomButton.addEventListener("click", async () => {
	try {
		const lockIcon = document.getElementById("check-lock-room")
		if (mediasoupClientVariable.lockRoom) {
			const response = await db.put({ enableWaitingRoom: false, enableSharingScreen: false })
			if (!response.status) {
				throw { name: "request failed", message: response.message }
			}
			socket.emit("lock-room", { userId: usersVariable.userId, roomId: meetingInfo.roomId, lock: false }, ({ status }) => {
				if (status) {
					mediasoupClientVariable.lockRoom = false
					if (!lockIcon.classList.contains("d-none")) {
						lockIcon.classList.add("d-none")
					}
				}
			})
		} else {
			const response = await db.put({ enableWaitingRoom: true, enableSharingScreen: true })
			if (!response.status) {
				throw { name: "request failed", message: response.message }
			}
			socket.emit("lock-room", { userId: usersVariable.userId, roomId: meetingInfo.roomId, lock: true }, ({ status }) => {
				if (status) {
					mediasoupClientVariable.lockRoom = true
					lockIcon.classList.remove("d-none")
				}
			})
		}
	} catch (error) {
		console.log("- Error Lock Room : ", error)
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
		if (event.key == "Enter" && messageInput.value && messageInput.value.trim() != "") {
			const chatToElement = document.querySelector('[id^="chat-to-"].selected')
			const chatTo = chatToElement.dataset.userId
			const isPrivate = chatTo == "everyone" ? false : true
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

			await usersVariable.sendChat({ socket, message: { content: message }, type: "message", chatTo })

			const isSender = true
			const randomId = await Helpers.generateRandomId(20, "-", 3)
			const messageTemplate = await eventListenerCollection.messageTemplate({
				isSender,
				username: usersVariable.username,
				messageDate: formattedTime,
				message: { content: message },
				picture: usersVariable.picture,
				id: randomId,
				chatTo,
				userId: usersVariable.userId,
			})
			await eventListenerCollection.appendMessage({ message: messageTemplate, chatTo })

			if (isPrivate) {
				const randomId2 = await Helpers.generateRandomId(20, "-", 3)
				const messageTemplatePublic = await eventListenerCollection.messageTemplate({
					isSender,
					username: usersVariable.username,
					messageDate: formattedTime,
					message: { content: message },
					picture: usersVariable.picture,
					id: randomId2,
					chatTo,
					userId: usersVariable.userId,
				})
				await eventListenerCollection.appendMessage({ message: messageTemplatePublic, chatTo: "everyone" })
				await usersVariable.sendChat({ socket, message: { content: message }, type: "message", chatTo: "everyone", resend: true })
			}

			let chatContent = document.getElementById(`chat-${chatTo}`)
			chatContent.scrollTop = chatContent.scrollHeight
			messageInput.value = ""

			const data = {
				isPrivate,
				to: chatTo == "everyone" ? undefined : chatTo,
				content: message,
				messageDate: messageDate,
				type: "message",
			}

			const response = await db.postChat({ ...data })
		}
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

const sendMessageButton = document.getElementById("send-message-button")
sendMessageButton.addEventListener("click", async (event) => {
	try {
		const username = usersVariable.userId
		const chatToElement = document.querySelector('[id^="chat-to-"].selected')
		const chatTo = chatToElement.dataset.userId
		const isPrivate = chatTo == "everyone" ? false : true
		const messageDate = new Date()
		const formattedTime = messageDate.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		})

		const messageFileInput = document.getElementById("chat-file")
		const file = messageFileInput.files[0]
		const userId = usersVariable.userId
		const isSender = true
		let fileDetail = {
			fileSize: "0",
			fileName: "",
			status: false,
			message: "",
			api: "",
		}
		let type = "message"

		if (file) {
			console.log(file.type)
			type = "file"
			if (file.type.startsWith("image/")) {
				type = "image"
			} else if (file.type.startsWith("video/")) {
				type = "video"
			} else {
				type = "file"
			}

			const { status, message: messageResponse, api } = await sendFile()
			if (status) {
				fileDetail.status = status
				fileDetail.message = messageResponse
				fileDetail.api = api
			}
			const fileSize = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : (file.size / 1024).toFixed(2) + " KB"
			fileDetail.fileSize = fileSize
			fileDetail.fileName = file.name
		}

		const message = messageInput.value
		if (!file && (message.trim() == "" || !message)) {
			return
		}

		if (!file) {
			const data = {
				isPrivate,
				to: chatTo == "everyone" ? undefined : chatTo,
				content: message,
				messageDate: messageDate,
				type: "message",
			}
			const response = await db.postChat({ ...data })
		}

		await usersVariable.sendChat({ socket, message: type == "message" ? { content: message } : { ...fileDetail }, type, chatTo, fileDetail })

		const randomId = await Helpers.generateRandomId(20, "-", 3)
		const messageTemplate = await eventListenerCollection.messageTemplate({
			isSender,
			username: usersVariable.username,
			messageDate: formattedTime,
			message: type == "message" ? { content: message } : { ...fileDetail },
			picture: usersVariable.picture,
			type,
			id: randomId,
			chatTo,
			userId: usersVariable.userId,
		})
		await eventListenerCollection.appendMessage({ message: messageTemplate, chatTo })
		await eventListenerCollection.donwloadFileMessage({ id: randomId, api: fileDetail.api, status: true, type })

		// If private then apply it to everyone container too
		if (isPrivate) {
			const randomId2 = await Helpers.generateRandomId(20, "-", 3)
			const messageTemplatePublic = await eventListenerCollection.messageTemplate({
				isSender,
				username: usersVariable.username,
				messageDate: formattedTime,
				message: type == "message" ? { content: message } : { ...fileDetail },
				picture: usersVariable.picture,
				type,
				id: randomId2,
				chatTo,
				userId: usersVariable.userId,
			})
			await eventListenerCollection.appendMessage({ message: messageTemplatePublic, chatTo: "everyone" })
			await eventListenerCollection.donwloadFileMessage({ id: randomId, api: fileDetail.api, status: true, type })
			await usersVariable.sendChat({
				socket,
				message: type == "message" ? { content: message } : { ...fileDetail },
				type,
				chatTo,
				fileDetail,
				resend: true,
			})
		}
		let chatContent = document.getElementById(`chat-${chatTo}`)
		chatContent.scrollTop = chatContent.scrollHeight
		messageInput.value = ""
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
		const username = item.querySelector(".user-list-username").textContent.toLowerCase()

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
		await navigator.clipboard.writeText(`${baseUrl}/?rid=${meetingInfo.roomId}&pw=${meetingInfo.password}`)
		const clipboardSuccess = document.getElementById("clipboard-success")

		clipboardSuccess.style.opacity = 1
		setTimeout(() => {
			clipboardSuccess.removeAttribute("style")
		}, 2000)
	} catch (error) {
		console.log("- Error Share Link Button : ", error)
	}
})

const messageToButton = document.getElementById("message-to-button")

messageToButton.addEventListener("click", (e) => {
	eventListenerCollection.messageListEvent()
})

const messageFileInput = document.getElementById("chat-file")
const chatInputFileEvent = ({ status }) => {
	try {
		const inputText = document.getElementById("message-input")
		const inputFile = document.getElementById("file-input")
		if (status) {
			inputText.classList.remove("d-none")
			if (!inputFile.classList.contains("d-none")) {
				inputFile.classList.add("d-none")
			}
		} else {
			inputFile.classList.remove("d-none")
			if (!inputText.classList.contains("d-none")) {
				inputText.classList.add("d-none")
			}
		}
	} catch (error) {
		console.log("- Error Chat Input File : ", error)
	}
}

const sendFile = async () => {
	try {
		const messageFileInput = document.getElementById("chat-file")
		const file = messageFileInput.files[0]
		const chatToElement = document.querySelector('[id^="chat-to-"].selected')
		const chatTo = chatToElement.dataset.userId
		const isPrivate = chatTo == "everyone" ? false : true

		if (!file) return

		const formData = new FormData()
		formData.append("file", file)
		formData.append("to", chatTo == "everyone" ? undefined : chatTo)
		formData.append("isPrivate", isPrivate)
		formData.append("type", "file")
		formData.append("messageDate", new Date())

		const response = await db.postFile(formData)

		if (!response.status) {
			return { status: false, message: response?.message || "Error uploading file", api: "" }
		}
		return { status: true, message: response?.message || "Successfully upload the file", api: response?.data[0].api }
	} catch (error) {
		console.log("- Error Send File: ", error)
		Users.warning({ message: error?.message || error })
	} finally {
		// Clear the input
		const messageFileInput = document.getElementById("chat-file")
		if (messageFileInput) messageFileInput.value = ""
		await chatInputFileEvent({ status: true })
	}
}

messageFileInput.addEventListener("input", async (e) => {
	try {
		const file = e.target.files[0]
		if (!file) return

		const fileIcon = document.getElementById("chat-file-icon")
		const fileName = document.getElementById("chat-file-name")
		const fileSize = document.getElementById("chat-file-size")

		fileName.textContent = file.name

		let displaySize
		if (file.size >= 1024 * 1024) {
			displaySize = (file.size / (1024 * 1024)).toFixed(2) + " MB"
		} else {
			displaySize = (file.size / 1024).toFixed(2) + " KB"
		}

		fileSize.textContent = displaySize

		await chatInputFileEvent({ status: false })
	} catch (error) {
		console.log("- Error Send File: ", error)
		Users.warning({ message: error?.message || error })
	}
})

const cancelInputFile = document.getElementById("chat-close")
cancelInputFile.addEventListener("click", async (e) => {
	const messageFileInput = document.getElementById("chat-file")
	await chatInputFileEvent({ status: true })
	if (messageFileInput) {
		messageFileInput.value = ""
	}
})

const chatEveryone = document.getElementById("chat-to-everyone")
chatEveryone.addEventListener("click", (e) => {
	Users.resetChat()
	Users.messageListEvent()
})

// Click Oustide Container
document.addEventListener("click", (e) => {
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

window.addEventListener("beforeunload", (event) => {
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
				muteIcon.src = `${baseUrl}/assets/icons/muted_speaker_mobile.svg`
				gainNode.gain.value = 0
			} else {
				muteIcon.src = `${baseUrl}/assets/icons/mute_speaker_mobile.svg`
				gainNode.gain.value = 1
			}
		} catch (error) {
			console.log("- Error Mute Speaker:", error)
		}
	})
}

if (isViewer) {
	getViewerFeature()
}
