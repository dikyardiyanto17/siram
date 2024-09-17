const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const url = window.location

const joinForm = document.getElementById("join-form")
const joinSubmit = document.getElementById("submit-join")
const modalTitle = document.getElementById("modal-title")
const waitingModal = document.getElementById("waiting-modal-container")
joinSubmit.addEventListener("click", (e) => {
	e.preventDefault()
	const roomId = document.getElementById("room_id").value
	if (!roomId) {
		return
	}
	const goTo = url + "room/" + roomId
	joiningRoom({ roomId })
})

socket.on("response-member-waiting", async ({ response, roomId }) => {
	try {
		if (response) {
			window.location.href = url.origin + "/room/" + roomId
		} else {
			waitingModal.classList.add("d-none")
			setFormStyle({ status: true })
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

const joiningRoom = async ({ roomId }) => {
	try {
		socket.connect()
		socket.emit("joining-room", { roomId, position: "home" }, ({ status, roomName, meetingDate }) => {
			if (status) {
				window.location.href = url.origin + "/room/" + roomName.replace(/\s+/g, "-")
			} else {
				let hours = new Date(meetingDate).getHours()
				let minutes = new Date(meetingDate).getMinutes()

				hours = hours < 10 ? "0" + hours : hours
				minutes = minutes < 10 ? "0" + minutes : minutes
				const timeString = `${hours}.${minutes}`

				setFormStyle({ status: false })
				modalTitle.innerHTML = roomName
				document.getElementById("start_date_modal").innerHTML = timeString
				waitingModal.classList.remove("d-none")
			}
		})
	} catch (error) {
		console.log("- Error Joining Room : ", error)
	}
}

const generateRandomId = (length, separator = "-", separatorInterval = 4) => {
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

// const newMeetingButton = document.getElementById("new-meeting")
// newMeetingButton.addEventListener("click", (e) => {
// 	const id = generateRandomId(12)
// 	joiningRoom({ roomId: id })
// })

const roomId = document.getElementById("room_id")
roomId.addEventListener("change", (e) => {
	localStorage.setItem("room_id", e.target.value)
})

// const rightBar = document.getElementById('right-bar-id')
// const totalCarousel = rightBar.children.length
// const carousels = document.querySelectorAll(".carousel")
// let currentIndex = 0

// function showCarousel(index) {
// 	carousels[currentIndex].classList.remove("active")
// 	carousels[currentIndex].classList.add("hide")
// 	currentIndex = index
// 	carousels[currentIndex].classList.add("hide")
// 	carousels[currentIndex].classList.add("active")
// }

// function nextSlide() {
// 	const nextIndex = (currentIndex + 1) % carousels.length
// 	showCarousel(nextIndex)
// }

// function startCarousel() {
// 	setInterval(nextSlide, 5000) // Change slide every 5 seconds (adjust the interval as needed)
// }
// startCarousel()

document.addEventListener("DOMContentLoaded", (e) => {
	document.getElementById("loading-id").className = "loading-hide"
	setFormStyle({ status: true })
})

const setFormStyle = async ({ status }) => {
	try {
		if (status) {
			joinForm.removeAttribute("style")
		} else {
			joinForm.style.position = "relative"
			joinForm.style.zIndex = "-1"
		}
	} catch (error) {
		console.log("- Error Set Form Style : ", error)
	}
}
