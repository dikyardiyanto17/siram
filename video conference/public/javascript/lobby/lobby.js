const { default: Swal } = require("sweetalert2")
const { getSocket } = require("../socket/socket")

const viewerCheckbox = document.getElementById("viewer-checkbox")
const micButton = document.getElementById("mic-button")
const cameraButton = document.getElementById("camera-button")
const waitingModal = document.getElementById("waiting-modal-container")
const modalTitle = document.getElementById("modal-title")
const socket = getSocket(socketBaseUrl, socketPath)
const availableDevice = {
	camera: true,
	microphone: true,
}

const userSettings = {
	isCameraActive: false,
	isMicActive: false,
	isViewer: false,
}
micButton.addEventListener("click", (e) => {
	try {
		const micIcon = document.getElementById("mic-icon")
		const iconSrc = micIcon.src.split("/").pop() // e.g., 'mic_muted.svg'

		if (iconSrc === "mic_muted.svg") {
			userSettings.isMicActive = true
			micIcon.src = `${baseUrl}/assets/icons/mic.svg`
		} else {
			userSettings.isMicActive = false
			micIcon.src = `${baseUrl}/assets/icons/mic_muted.svg`
		}
	} catch (error) {
		console.log("- Error Mic Button:", error)
	}
})

const checkMediaDevices = async () => {
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.warn("MediaDevices API not supported.")
		return { hasCamera: false, hasMic: false }
	}

	try {
		const devices = await navigator.mediaDevices.enumerateDevices()

		const hasCamera = devices.some((device) => device.kind === "videoinput")
		const hasMic = devices.some((device) => device.kind === "audioinput")

		if (!hasCamera && !hasMic) {
			await Swal.fire({
				title: "Device not found!",
				text: "Device is not available or detected!",
				icon: "info",
			})
		} else if (!hasCamera) {
			await Swal.fire({
				title: "Device not found!",
				text: "Camera is not available or detected!",
				icon: "info",
			})
		} else if (!hasMic) {
			await Swal.fire({
				title: "Device not found!",
				text: "Microphone is not available or detected!",
				icon: "info",
			})
		}
		availableDevice.camera = hasCamera
		availableDevice.microphone = hasMic
		return { hasCamera, hasMic }
	} catch (err) {
		console.error("Error accessing media devices:", err)
		return { hasCamera: false, hasMic: false }
	}
}

const joiningRoom = async ({ roomId, password }) => {
	try {
		await socket.connect()
		await socket.emit(
			"joining-room",
			{ position: "lobby", token: localStorage.getItem("room_token") },
			({ status, roomName }) => {
				if (status) {
					window.location.href = baseUrl + "/room/" + roomName.replace(/\s+/g, "-")
				} else {
					waitingModal.classList.remove("d-none")
				}
			}
		)
	} catch (error) {
		console.log("- Error Joining Room : ", error)
	}
}

checkMediaDevices()
cameraButton?.addEventListener("click", async (e) => {
	if (!availableDevice.camera) {
		Swal.fire({
			title: "Device not found!",
			text: "Camera device is not available!",
			icon: "error",
		})
		return
	}

	const videoPictureContainer = document.getElementById("video-picture-container")
	const video = document.getElementById("video-demo")
	const cameraIcon = document.getElementById("camera-icon")
	const iconSrc = cameraIcon.src.split("/").pop()

	if (iconSrc == "camera_off.svg") {
		// Hide picture container
		if (!videoPictureContainer.classList.contains("d-none")) {
			videoPictureContainer.classList.add("d-none")
		}

		// Start video stream
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					frameRate: { ideal: 30 },
				},
				audio: false,
			})
			video.srcObject = stream
			userSettings.isCameraActive = true
			cameraIcon.src = `${baseUrl}/assets/icons/camera.svg`
			video.play()
		} catch (err) {
			console.error("Failed to get video:", err)
			Swal.fire({
				title: "Error!",
				text: "Unable to access the camera.",
				icon: "error",
			})
		}
	} else {
		// Show picture container
		videoPictureContainer.classList.remove("d-none")

		userSettings.isCameraActive = false
		cameraIcon.src = `${baseUrl}/assets/icons/camera_off.svg`
		// Stop video stream
		if (video.srcObject) {
			video.srcObject.getTracks().forEach((track) => track.stop())
			video.srcObject = null
		}
	}
})

const lobbyForm = {
	participant_id: "",
	full_name: "",
}

document.addEventListener("DOMContentLoaded", (e) => {
	document.getElementById("loading-id").className = "loading-hide"
})

if (!localStorage.getItem("language")) {
	localStorage.setItem("language", "en")
} else {
	const language = localStorage.getItem("language")
	if (language !== "en" && language !== "id") {
		localStorage.setItem("language", "en")
	}
}

const changeLanguage = ({ language }) => {
	try {
		const nameInput = document.getElementById("full_name")
		const submitButton = document.getElementById("submit-button")

		if (language == "en") {
			nameInput.placeholder = "Name..."
			submitButton.innerHTML = "Continue"
		} else if (language == "id") {
			nameInput.placeholder = "Nama..."
			submitButton.innerHTML = "Lanjutkan"
		} else {
			throw { name: "error", message: "language id is not valid" }
		}
	} catch (error) {
		console.log("- Error Change Languange", error)
	}
}

changeLanguage({ language: localStorage.getItem("language") })

const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)

const rid = params.get("rid")
const pw = params.get("pw")

const generateRandomId = (length = 12, separator = "-", separatorInterval = 4) => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let randomId = ""

	for (let i = 0; i < length; i++) {
		if (i > 0 && i % separatorInterval === 0) {
			randomId += separator
		}

		const randomIndex = Math.floor(Math.random() * characters.length)
		randomId += characters.charAt(randomIndex)
	}

	return randomId
}

document.getElementById("participant_id").value = generateRandomId()

const warning = ({ message }) => {
	try {
		document.getElementById("warning-container").style.top = "50px"
		document.getElementById("warning-message").innerHTML = message
		setTimeout(() => {
			document.getElementById("warning-container").style.top = "-100%"
			setTimeout(() => {
				document.getElementById("warning-message").innerHTML = ""
			}, 1000)
		}, 3000)
	} catch (error) {
		console.log("- Error Warning Message : ", error)
	}
}

if (localStorage.getItem("full_name")) {
	console.log(localStorage.getItem("full_name"))
	document.getElementById("full_name").value = localStorage.getItem("full_name")
	lobbyForm.full_name = localStorage.getItem("full_name")
}

const lobbyFormElement = document.getElementById("lobby-form-container")
lobbyFormElement.addEventListener("submit", async (event) => {
	try {
		event.preventDefault()
		userSettings.isViewer = viewerCheckbox?.checked || false
		localStorage.setItem("isCameraActive", userSettings.isCameraActive)
		localStorage.setItem("isMicActive", userSettings.isMicActive)
		localStorage.setItem("isViewer", viewerCheckbox?.checked || false)
		lobbyForm.full_name = document.getElementById("full_name").value
		lobbyForm.participant_id = document.getElementById("participant_id").value

		if (!lobbyForm.full_name || lobbyForm.full_name.trim() == "") {
			throw { message: "Nama Lengkap Wajib Di isi" }
		}

		if (!lobbyForm.participant_id || lobbyForm.participant_id.trim() == "") {
			throw { message: "Id Peserta Wajib Di isi" }
		}

		localStorage.setItem("full_name", lobbyForm.full_name)
		localStorage.setItem("participant_id", lobbyForm.participant_id)

		const response = await fetch(`${baseUrl}/custom_api/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...lobbyForm, isViewer: viewerCheckbox.checked }),
		})
		if (response.ok) {
			const { status, message, token } = await response.json()
			if (status) {
				const responseVideoConference = await fetch(`${baseUrl}/api/login`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...lobbyForm, isViewer: viewerCheckbox.checked }),
				})

				if (responseVideoConference.ok) {
					const data = await responseVideoConference.json()
					if (data.status) {
						await joiningRoom({ roomId: localStorage.getItem("room_id"), password: localStorage.getItem("password") })
					} else {
						throw { message: "lobby failed" }
					}
				}
			} else {
				throw { message: "Peserta Tidak ditemukan" }
			}
		} else {
			throw { message: "Peserta Tidak ditemukan" }
		}
	} catch (error) {
		console.log("- Error Submmit Login : ", error)
		await warning({ message: error.message || "Login gagal, pastikan Nama dan ID yang dimasukkan valid" })
	}
})

socket.on("response-member-waiting", async ({ response, roomId, id }) => {
	try {
		if (response) {
			window.location.href = baseUrl + "/room/" + roomId
		} else {
			waitingModal.classList.add("d-none")
			setFormStyle({ status: true })
			socket.emit("rejected-response", { id })
			Swal.fire({
				title: "Ditolak!",
				text: "Anda tidak diperkanankan masuk ruangan!",
				icon: "error",
			})
		}
	} catch (error) {
		console.log("- Error Response Member Waiting : ", error)
	}
})
