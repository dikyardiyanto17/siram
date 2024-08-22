const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const url = window.location

const joinForm = document.getElementById("join-form")
const modalTitle = document.getElementById("modal-title")
const waitingModal = document.getElementById("waiting-modal-container")
joinForm.addEventListener("submit", (e) => {
	e.preventDefault()
	const roomId = document.getElementById("room-id").value
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
				title: "Rejected!",
				text: "You're not allowed to join the room",
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
		socket.emit("joining-room", { roomId, userId: generateRandomId(20), position: "home" }, ({ userId, status, roomId }) => {
			localStorage.setItem("user_id", userId)
			if (!status) {
				window.location.href = url.origin + "/room/" + roomId
			} else {
				setFormStyle({ status: false })
				modalTitle.innerHTML = roomId
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

const roomId = document.getElementById("room-id")
roomId.addEventListener("input", (e) => {
	localStorage.setItem("room-id", e.target.value)
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
