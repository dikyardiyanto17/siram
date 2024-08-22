const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const { EventListener } = require("./eventListener")
const { Users } = require("./user")
const { MediaSoupClient } = require("./mediasoupClient")
const url = window.location.pathname
const parts = url.split("/")
const roomName = parts[2]

const eventListenerCollection = new EventListener({ micStatus: false, cameraStatus: false, roomId: roomName })
const usersVariable = new Users()
const mediasoupClientVariable = new MediaSoupClient()

socket.connect()

socket.emit(
	"joining-room",
	{ roomId: roomName, userId: localStorage.getItem("user_id"), position: "room" },
	async ({ userId, roomId, status, isAdmin, rtpCapabilities }) => {
		try {
			if (status) {
				let filteredRtpCapabilities = { ...rtpCapabilities }
				filteredRtpCapabilities.headerExtensions = filteredRtpCapabilities.headerExtensions.filter((ext) => ext.uri !== "urn:3gpp:video-orientation")
				usersVariable.userId = userId

				mediasoupClientVariable.rtpCapabilities = filteredRtpCapabilities
				await mediasoupClientVariable.createDevice()
				await mediasoupClientVariable.setEncoding()
				await mediasoupClientVariable.getMyStream()
				await usersVariable.addMyVideo({ stream: mediasoupClientVariable.myStream })

				localStorage.setItem("user_id", userId)
				await usersVariable.addAllUser({ userId, admin: isAdmin, socketId: socket.id })
				await mediasoupClientVariable.createSendTransport({ socket, roomId: roomName, userId: userId, usersVariable })
			} else {
				window.location.href = window.location.origin
			}
		} catch (error) {
			console.log("- Error Join Room : ", error)
		}
	}
)

socket.on("member-joining-room", ({ id, socketId }) => {
	try {
		eventListenerCollection.methodAddWaitingUser({ id: id, username: id, socket })
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

socket.on("user-list", ({ type, userId, isActive }) => {
	try {
		eventListenerCollection.changeUserList({ type, id: userId, isActive })
	} catch (error) {
		console.log("- Error On User List : ", error)
	}
})

socket.on("user-logout", ({ userId }) => {
	try {
		eventListenerCollection.deleteUserList({ id: userId })
		usersVariable.decreaseUsers()
		usersVariable.deleteVideo({ userId })
	} catch (error) {
		console.log("- Error User Log Out : ", error)
	}
})

socket.on("message", async ({ userId, message }) => {
	try {
		const messageDate = new Date()
		const formattedTime = messageDate.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
		})
		const isSender = false
		const messageTemplate = await eventListenerCollection.messageTemplate({ isSender, username: userId, messageDate: formattedTime, message })
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

socket.on("close-consumer", async ({ consumerId }) => {
	try {
		await mediasoupClientVariable.closeConsumer({ consumerId })
	} catch (error) {
		console.log("- Error Close Consumer : ", error)
	}
})

// Microphone Button
let microphoneButton = document.getElementById("mic-icon")
microphoneButton.addEventListener("click", () => {
	try {
		const userId = usersVariable.userId
		eventListenerCollection.changeMicButton({ id: userId })
		usersVariable.allUsers.forEach((user) => {
			if (user.userId != userId) {
				socket.emit("user-list", { type: "mic", userId: user.userId, to: user.socketId, isActive: eventListenerCollection.microphoneStatus })
			}
		})
	} catch (error) {
		console.log("- Error Microphone Button : ", error)
	}
})

// Camera Button
let cameraButton = document.getElementById("camera-icon")
cameraButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeCameraButton()
	} catch (error) {
		console.log("- Error Camera Button : ", error)
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
raiseHandButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeRaiseHandButton()
	} catch (error) {
		console.log("- Error Raise Hand Button : ", error)
	}
})

// Screen Sharing Button
let screenSharingButton = document.getElementById("screen-sharing-button")
screenSharingButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeScreenSharingButton()
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

// CC Button
let ccButton = document.getElementById("cc-button")
ccButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeCCButton()
	} catch (error) {
		console.log("- Error Screen Sharing Button : ", error)
	}
})

// Option Button
let optionButton = document.getElementById("option-button")
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
muteAllButton.addEventListener("click", () => {
	try {
		eventListenerCollection.changeMuteAllButton()
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
		eventListenerCollection.recordMeeting({ from: false })
	} catch (error) {
		console.log("- Error Record : ", error)
	}
})

let pauseRecord = document.getElementById("pause-record")
pauseRecord.addEventListener("click", () => {
	try {
		eventListenerCollection.pauseRecord()
	} catch (error) {
		console.log("- Error Pause Record : ", error)
	}
})

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
		eventListenerCollection.recordMeeting({ from: true })
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
		container.addEventListener("click", () => {
			try {
				eventListenerCollection.selectVideoLayout({ container })
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
		container.addEventListener("click", () => {
			try {
				eventListenerCollection.selectLayoutCount({ container })
			} catch (error) {
				console.log("- Error Select Video Layout : ", error)
			}
		})
	} catch (error) {
		console.log("- Error Looping Select Video Layout : ", error)
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

			const userId = usersVariable.userId
			usersVariable.allUsers.forEach((user) => {
				if (user.userId != userId) {
					socket.emit("message", { userId: user.userId, to: user.socketId, message })
				}
			})

			const isSender = true
			const messageTemplate = await eventListenerCollection.messageTemplate({ isSender, username, messageDate: formattedTime, message })
			await eventListenerCollection.appendMessage({ message: messageTemplate })
			messageInput.value = ""
		}
	} catch (error) {
		console.log("- Error Send Message : ", error)
	}
})

// Click Oustide Container
document.addEventListener("click", function (e) {
	try {
		eventListenerCollection.hideButton()
	} catch (error) {
		console.log("- Error HideAll Button : ", error)
	}
})
