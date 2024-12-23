const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")

const loader = document.getElementById("loading")
const localVideo = document.getElementById("local-video")
const imageOutput = document.getElementById("image--output")
const canvasElement = document.getElementById("canvas-element")
const progressBar = document.getElementById("progress-bar")
const proccessIcon = document.getElementById("proccess-icon")
const proccessMessage = document.getElementById("proccess-message")
const tryAgainContainer = document.getElementById("try-again-container-id")
const tryAgainButton = document.getElementById("try-again-id")
const waitingModal = document.getElementById("waiting-modal-container")
const modalTitle = document.getElementById("modal-title")
let image_data_url
const baseUrl = window.location.origin
let base64Photo = `${serverUrl}/photo/${userPhoto}.png`
let descriptors = { desc1: null, desc2: null }
let intervalFR
let result = false

Promise.all([
	faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.tinyFaceDetector.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.loadFaceRecognitionModel("../../assets/plugins/face-api/models"),
]).then((_) => {
	loader.className = "loading-hide"
})

const joiningRoom = async ({ roomId, password }) => {
	try {
		await socket.connect()
		await socket.emit("joining-room", { position: "lobby", token }, ({ status, roomName, meetingDate, meeting_type }) => {
			console.log(status, roomName, meeting_type)
			if (status) {
				window.location.href = window.location.origin + "/room/" + roomName.replace(/\s+/g, "-")
			} else {
				if (meeting_type == 2) {
					Swal.fire({
						title: "Invalid Room",
						text: "Pastikan ID Room dan Password benar!",
						icon: "error",
					})
					return
				}
				if (!meetingDate || !roomName || roomName.trim() == "") {
					Swal.fire({
						title: "Invalid Room",
						text: "Pastikan ID Room dan Password benar!",
						icon: "error",
					})
					return
				}
				let hours = new Date(meetingDate).getHours()
				let minutes = new Date(meetingDate).getMinutes()
				hours = hours < 10 ? "0" + hours : hours
				minutes = minutes < 10 ? "0" + minutes : minutes
				const timeString = `${hours}.${minutes}`
				modalTitle.innerHTML = roomName
				document.getElementById("start_date_modal").innerHTML = timeString
				waitingModal.classList.remove("d-none")
			}
		})
	} catch (error) {
		console.log("- Error Joining Room : ", error)
	}
}

const warning = ({ message }) => {
	try {
		document.getElementById("warning-container").style.top = "50px"
		document.getElementById("warning-message").innerHTML = message

		setTimeout(() => {
			document.getElementById("warning-container").style.top = "-100%"
			setTimeout(() => {
				document.getElementById("warning-message").innerHTML = ""
			}, 500)
		}, 3000)
	} catch (error) {
		console.log("- Error Warning Message : ", error)
	}
}

const comparePicture = async ({ picture1, picture2 }) => {
	try {
		console.log(picture1)
		console.log(picture2)
		loader.removeAttribute("class")
		const input1 = await faceapi.fetchImage(picture1)
		const input2 = await faceapi.fetchImage(picture2)
		descriptors.desc1 = await faceapi.computeFaceDescriptor(input1)
		descriptors.desc2 = await faceapi.computeFaceDescriptor(input2)
		const distance = faceapi.utils.round(faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2))
		loader.className = "loading-hide"
		document.getElementById("face-recognition-canvas-id").remove()
		console.log("- Distance : ", distance)
		if (distance <= 0.4) {
			result = true
			proccessIcon.src = `/assets/icons/success.svg`
			proccessMessage.innerHTML = "Verifikasi berhasil"
			if (!tryAgainContainer.classList.contains("d-none")) {
				tryAgainContainer.classList.add("d-none")
			}
			await joiningRoom({ password, roomId })
		} else {
			result = false
			proccessIcon.src = `/assets/icons/denied.svg`
			proccessMessage.innerHTML = "Wajah tidak dikenali"
			tryAgainContainer.classList.remove("d-none")
			await warning({ message: `Verifikasi wajah gagal, Kemiripan wajah : ${100 - distance * 100} %` })
			await stopFR()
		}
	} catch (error) {
		console.log("- Error Comparing Picture : ", error)
	}
}

const convertToBase64 = (arrayBuffer) => {
	let binary = ""
	const bytes = new Uint8Array(arrayBuffer)
	const len = bytes.length
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return atob(btoa(binary))
}

const getCameraReady = async () => {
	try {
		// base64Photo = await convertToBase64(userPhoto.data)

		const config = {
			video: true,
		}
		const stream = await navigator.mediaDevices.getUserMedia(config)
		localVideo.srcObject = stream
	} catch (error) {
		console.log("- Error Getting Camera : ", error)
	}
}

const createFaceBox = async ({ width, height }) => {
	try {
		const canvas = document.getElementById("face-matcher-box")

		canvas.style.position = "absolute"
		canvas.height = height
		canvas.width = width

		const ctx = canvas.getContext("2d")

		const boxHeight = 200
		const boxWidth = 170

		const xPosition = (width - boxWidth) / 2
		const yPosition = (height - boxHeight) / 2

		ctx.strokeStyle = "white"
		ctx.strokeRect(xPosition, yPosition, boxWidth, boxHeight)

		ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
		ctx.fillRect(xPosition, yPosition, boxWidth, boxHeight)

		return { boxHeight, boxWidth, xPosition, yPosition }
	} catch (error) {
		console.log("- Error Creating Box Canvas : ", error)
	}
}

const startFR = async () => {
	try {
		const video = document.getElementById("local-video")
		const parentElement = video.parentElement

		const parentWidth = parentElement.offsetWidth
		const parentHeight = parentElement.offsetHeight
		const canvas = faceapi.createCanvasFromMedia(video)
		canvas.id = "face-recognition-canvas-id"
		document.getElementById("face-recognition-id").appendChild(canvas)
		const displaySize = { width: parentWidth, height: parentHeight }
		faceapi.matchDimensions(canvas, displaySize)
		const boxCoordination = await createFaceBox({
			width: canvas.clientWidth,
			height: canvas.clientHeight,
		})
		let isValidPosition = []
		intervalFR = setInterval(async () => {
			const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
			const resizedDetections = faceapi.resizeResults(detections, displaySize)
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
			faceapi.draw.drawDetections(canvas, resizedDetections)

			let xCalculation = boxCoordination.xPosition - resizedDetections[0]?.box?.x
			let yCalculation = boxCoordination.yPosition - resizedDetections[0]?.box?.y
			let widthCalculation = boxCoordination.boxWidth - resizedDetections[0]?.box?.width
			let heightCalculation = boxCoordination.boxHeight - resizedDetections[0]?.box?.height
			if (isValidPosition.length >= 20 && !image_data_url) {
				await capturePicture()
				progressBar.value = 100
				// isValidPosition = []
				await clearInterval(intervalFR)
				intervalFR = null
			}

			// console.log(Math.abs(xCalculation), Math.abs(yCalculation), Math.abs(widthCalculation), Math.abs(heightCalculation), resizedDetections[0].score)

			if (
				!image_data_url &&
				isValidPosition.length < 20 &&
				Math.abs(xCalculation) <= 50 &&
				Math.abs(yCalculation) <= 50 &&
				Math.abs(widthCalculation) <= 200 &&
				Math.abs(heightCalculation) <= 200 &&
				resizedDetections[0].score >= 0.9
			) {
				progressBar.value = isValidPosition.length * 5
				proccessIcon.src = `/assets/icons/warn.svg`
				proccessMessage.innerHTML = "Mohon posisi wajah disesuaikan dengan frame."
				isValidPosition.push(true)
			} else if (image_data_url) {
				if (result) {
					proccessIcon.src = `/assets/icons/success.svg`
					proccessMessage.innerHTML = "Verifikasi berhasil"
				} else {
					proccessIcon.src = `/assets/icons/denied.svg`
					proccessMessage.innerHTML = "Verifikasi Gagal"
				}
			} else {
				isValidPosition = []
				progressBar.value = 0
			}
		}, 300)
	} catch (error) {
		console.log("- Error Starting Face Recognition : ", error)
	}
}

const tryAgain = () => {
	try {
		if (!imageOutput.classList.contains("d-none")) {
			imageOutput.classList.add("d-none")
		}

		localVideo.classList.remove("d-none")

		document.getElementById("face-matcher-box").classList.remove("d-none")
		document.getElementById("face-recognition-id").classList.remove("d-none")
		image_data_url = null
	} catch (error) {
		console.log("- Error Try Again : ", error)
	}
}

const stopFR = async () => {
	try {
		if (intervalFR) {
			await clearInterval(intervalFR)
			intervalFR = null
		}
		const tracks = await localVideo.srcObject.getTracks()

		tracks.forEach((track) => {
			try {
				track.stop()
			} catch (error) {
				console.log("- Error Stopping tracks : ", error)
			}
		})

		localVideo.srcObject = null

		await tryAgain()
	} catch (error) {
		console.log("- Error Stop FR : ", error)
	}
}

const capturePicture = async () => {
	try {
		canvasElement.width = localVideo.videoWidth
		canvasElement.height = localVideo.videoHeight
		canvasElement.getContext("2d").drawImage(localVideo, 0, 0)
		image_data_url = canvasElement.toDataURL("image/png")
		imageOutput.src = image_data_url
		imageOutput.classList.remove("d-none")

		localVideo.classList.add("d-none")
		document.getElementById("face-matcher-box").classList.add("d-none")
		document.getElementById("face-recognition-id").classList.add("d-none")

		await comparePicture({ picture1: base64Photo, picture2: image_data_url })
	} catch (error) {
		console.error("Error capturing picture:", error)
	}
}

tryAgainButton.addEventListener("click", getCameraReady)
localVideo?.addEventListener("play", startFR)
// localVideo?.addEventListener("ended", stopFR)

getCameraReady()

socket.on("response-member-waiting", async ({ response, roomId, id }) => {
	try {
		if (response) {
			window.location.href = window.location.origin + "/room/" + roomId
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
