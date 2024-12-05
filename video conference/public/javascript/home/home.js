const { default: Swal } = require("sweetalert2")
const { socket } = require("../socket/socket")
const url = window.location

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

joinSubmit.addEventListener("click", async (e) => {
	try {
		e.preventDefault()
		await socket.connect()
		const roomId = document.getElementById("room_id").value
		const password = document.getElementById("password").value
		if (!roomId || roomId.trim() == "") {
			await Swal.fire({
				title: "Bad Request",
				text: "ID Room wajib di isi",
				icon: "error",
			})
			return
		}

		if (!password || password.trim() == "") {
			await Swal.fire({
				title: "Bad Request",
				text: "Password room wajib di isi",
				icon: "error",
			})
			return
		}

		const responseDatabaseRoom = await fetch(`${serverUrl}/api/video_conference/room?rid=${roomId}&pw=${password}`, {
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
