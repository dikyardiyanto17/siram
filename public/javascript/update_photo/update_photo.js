const loader = document.getElementById("loading")
const localVideo = document.getElementById("local-video")
const imageOutput = document.getElementById("image--output")
const canvasElement = document.getElementById("canvas-element")
const progressBar = document.getElementById("progress-bar")
const proccessIcon = document.getElementById("proccess-icon")
const proccessMessage = document.getElementById("proccess-message")
let image_data_url
const baseUrl = window.location.origin

Promise.all([
	faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/plugins/face-api/models"),
	faceapi.nets.tinyFaceDetector.loadFromUri("../../assets/plugins/face-api/models"),
]).then((_) => {
	loader.className = "loading-hide"
})

const getCameraReady = async () => {
	try {
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
		const parentElement = video.parentElement // Get the parent element of the video

		// Retrieve the parent's width and height
		const parentWidth = parentElement.offsetWidth
		const parentHeight = parentElement.offsetHeight
		const canvas = faceapi.createCanvasFromMedia(video)
		document.getElementById("face-recognition-id").appendChild(canvas)
		const displaySize = { width: parentWidth, height: parentHeight } // Something wrong in here
		console.log("- TEST : ", parentHeight, " = ", parentWidth, " - ", video.width, "HJKHKJH", video.height)
		faceapi.matchDimensions(canvas, displaySize)
		const boxCoordination = await createFaceBox({
			width: canvas.clientWidth,
			height: canvas.clientHeight,
		})
		let isValidPosition = []
		setInterval(async () => {
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
				isValidPosition = []
			}

			console.log(Math.abs(xCalculation), Math.abs(yCalculation), Math.abs(widthCalculation), Math.abs(heightCalculation), resizedDetections[0].score)

			if (
				!image_data_url &&
				isValidPosition.length < 20 &&
				Math.abs(xCalculation) <= 27 &&
				Math.abs(yCalculation) <= 27 &&
				Math.abs(widthCalculation) <= 150 &&
				Math.abs(heightCalculation) <= 150 &&
				resizedDetections[0].score >= 0.95
			) {
				console.log("VALID")
				progressBar.value = isValidPosition.length * 5
				isValidPosition.push(true)
			} else if (image_data_url) {
				console.log("Already Take A Photo")
			} else {
				isValidPosition = []
				progressBar.value = 0
			}
		}, 100)
	} catch (error) {
		console.log("- Error Starting Face Recognition : ", error)
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

		// Get the current URL from the browser
		const currentUrl = window.location.href

		// Create a URL object and use URLSearchParams
		const urlObj = new URL(currentUrl)
		const uid = urlObj.searchParams.get("uid")

		const response = await fetch(`${baseUrl}/api/photo?uid=${uid}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ photo: image_data_url }),
		})

		if (response.ok) {
			const data = await response.json()
			console.log(data)
			const { status } = data
			if (status) {
				proccessIcon.src = `/assets/icons/success.svg`
				proccessMessage.innerHTML = "Photo berhasil di perbarui"
				setTimeout(() => {
					window.location.href = `${baseUrl}/participant`
				}, 3000)
			}
		}
	} catch (error) {
		console.error("Error capturing picture:", error)
	}
}

localVideo?.addEventListener("play", startFR)

getCameraReady()
