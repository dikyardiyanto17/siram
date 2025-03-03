const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const url = window.location
const baseUrl = window.location.origin

const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)

const rid = params.get("rid")
const pw = params.get("pw")

const joinForm = document.getElementById("join-form")
const passwordForm = document.getElementById("password-form")
const passwordInput = document.getElementById("password")
const joinSubmit = document.getElementById("submit-join")
const modalTitle = document.getElementById("modal-title")
const waitingModal = document.getElementById("waiting-modal-container")
const roomId = document.getElementById("room_id")
const instantRoomButton = document.getElementById("instant-room")

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
		const languageTitleElement = document.getElementById("language-title")
		const roomIdInput = document.getElementById("room_id")
		const passwordInput = document.getElementById("password")
		const buttonJoin = document.getElementById("submit-join")
		const instantMeeting = document.getElementById("instant-meeting")

		languageTitleElement.classList.remove("skeleton")

		if (language == "en") {
			languageTitleElement.innerHTML = `Welcome to Video Conference <span>RDS!</span>`
			roomIdInput.placeholder = "Enter Room ID"
			passwordInput.placeholder = "Enter Room Password"
			buttonJoin.innerHTML = "Join"
			instantMeeting.innerHTML = "Instant Meeting"
		} else if (language == "id") {
			languageTitleElement.innerHTML = `Selamat Datang di Video Conference <span>RDS!</span>`
			roomIdInput.placeholder = "Masukkan Room Id"
			passwordInput.placeholder = "Masukkan Password"
			buttonJoin.innerHTML = "Masuk"
			instantMeeting.innerHTML = "Meeting Instan"
		} else {
			throw { name: "error", message: "language id is not valid" }
		}
	} catch (error) {
		console.log("- Error Change Languange")
	}
}

changeLanguage({ language: localStorage.getItem("language") })

const languageSelect = document.getElementById("language-select")

languageSelect.addEventListener("change", (event) => {
	changeLanguage({ language: event.target.value })
})

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

instantRoomButton.addEventListener("click", async () => {
	try {
		const randomId = await generateRandomId()
		const randomPassword = await generateRandomId()
		document.getElementById("room_id").value = randomId
		document.getElementById("password").value = randomPassword
	} catch (error) {
		console.log("- Error Instant Room Button : ", error)
	}
})

joinSubmit.addEventListener("click", async (e) => {
	try {
		e.preventDefault()
		await socket.connect()
		const roomId = document.getElementById("room_id").value
		const password = document.getElementById("password").value
		if (!roomId || roomId.trim() == "") {
			await Swal.fire({
				title: "Form tidak lengkap!",
				text: "ID Room wajib di isi",
				icon: "error",
			})
			return
		}

		if (!password || password.trim() == "") {
			await Swal.fire({
				title: "Form tidak lengkap!",
				text: "Password room wajib di isi",
				icon: "error",
			})
			return
		}

		const responseDatabaseRoom = await fetch(`${baseUrl}/custom_api/room?rid=${roomId}&pw=${password}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})

		if (responseDatabaseRoom.ok) {
			const dataResponseDatabaseRoom = await responseDatabaseRoom.json()
			if (dataResponseDatabaseRoom.status) {
				await joiningRoom({
					roomId: dataResponseDatabaseRoom.room_id,
					password: dataResponseDatabaseRoom.password,
					token: dataResponseDatabaseRoom.token,
				})
			} else {
				throw { message: dataResponseDatabaseRoom?.message || "ISE" }
			}
		} else {
			throw { message: "ID Ruangan tidak valid" }
		}
	} catch (error) {
		console.log("- error Joining room : ", error)
		if (error.message) {
			Swal.fire({
				title: "Invalid",
				text: error.message,
				icon: "error",
			})
		} else {
			Swal.fire({
				title: "Internal Server Error",
				text: "Gagal mendapatkan data dari server!",
				icon: "error",
			})
		}
	}
})

socket.on("response-member-waiting", async ({ response, roomId, id }) => {
	try {
		if (response) {
			window.location.href = url.origin + "/room/" + roomId
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

const joiningRoom = async ({ roomId, password, token }) => {
	try {
		socket.emit("joining-room", { position: "home", token }, ({ status, roomName, meetingDate, meeting_type }) => {
			if (status) {
				window.location.href = url.origin + "/room/" + roomName.replace(/\s+/g, "-")
			} else {
				if (meeting_type == 1) {
					window.location.href = `${window.location.origin}/lobby`
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

roomId.addEventListener("change", (e) => {
	localStorage.setItem("room_id", e.target.value)
})

document.addEventListener("DOMContentLoaded", (e) => {
	document.getElementById("loading-id").className = "loading-hide"
	if (rid && rid.trim() != "" && pw && pw.trim() != "") {
		passwordInput.value = pw
		roomId.value = rid
		joinSubmit.click()
	}
	setFormStyle({ status: true })
})

const setFormStyle = async ({ status }) => {
	try {
		if (status) {
			joinForm.removeAttribute("style")
			passwordForm.removeAttribute("style")
			joinSubmit.removeAttribute("style")
		} else {
			joinForm.style.position = "relative"
			joinForm.style.zIndex = "-1"
			passwordForm.style.position = "relative"
			passwordForm.style.zIndex = "-1"
			joinSubmit.style.display = "none"
		}
	} catch (error) {
		console.log("- Error Set Form Style : ", error)
	}
}

const logoutButton = document.getElementById("log-out-button")
logoutButton.addEventListener("click", async () => {
	try {
		const response = await fetch(`${window.location.origin}/logout`)
		if (response.ok) {
			window.location.href = `${window.location.href}login`
		}
	} catch (error) {
		console.log("- Error Log Out Button : ", error)
	}
})
