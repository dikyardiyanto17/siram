const { Helper } = require("../helper")
const { joinMeeting, initMeetingDate } = require("./home")

// modal meeting list
const listMeetingModalContainer = document.getElementById("meeting-list")
const listMeetingModalButton = document.getElementById("list-meeting-btn-modal")
const listMeetingModal = document.getElementById("list-meeting-id")

const showListModal = () => {
	if (listMeetingModalContainer.style.top == "0%") {
		listMeetingModalContainer.style.top = "-100%"
	} else {
		listMeetingModalContainer.style.top = "0%"
	}
}

listMeetingModalButton?.addEventListener("click", (e) => {
	showListModal()
})

listMeetingModalContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
	showListModal()
})

listMeetingModal?.addEventListener("click", (e) => {
	e.stopPropagation()
})

// modal create meeting
const scheduleModalButton = document.getElementById("schedule-meeting-btn-modal")
const startMeetingButton = document.getElementById("start-meeting-btn-modal")
const scheduleModal = document.getElementById("create-modal")
const scheduleModalContainer = document.getElementById("create-meeting-container-form")
const participantInput = document.getElementById("participants")

const createModalEvent = async () => {
	if (isLogin) {
		if (scheduleModal.style.top === "0%") {
			scheduleModal.style.top = "-100%"
			roomNameInput.value = ""
			descriptionInput.value = ""
			passwordInputModal.value = ""
			roomIdInputModal.value = ""
			document.getElementById("participants-box-id").innerHTML = ""
			await initMeetingDate()
			newMeeting = {
				roomName: "",
				start_date: undefined,
				end_date: undefined,
				roomId: "",
				password: "",
				description: "",
				participants: [],
			}
		} else {
			passwordInputModal.value = await Helper.generateRandomId()
			roomIdInputModal.value = await Helper.generateRandomId()
			scheduleModal.style.top = "0%"
		}
	}
}

const addChip = (email) => {
	const chip = document.createElement("span")
	const participantsBox = document.getElementById("participants-box-id")
	chip.classList.add("participant-added")
	chip.innerHTML = `${email} <i class="fa-solid fa-xmark delete-added" id="chip-${email}"></i>`
	participantsBox.appendChild(chip)

	const deleteChip = document.getElementById(`chip-${email}`)

	const handleDelete = (e) => {
		e.preventDefault()
		newMeeting.participants = newMeeting.participants.filter((x) => x !== email)

		deleteChip.removeEventListener("click", handleDelete)
		chip.remove()
	}
	deleteChip.addEventListener("click", handleDelete)
}

scheduleModalButton?.addEventListener("click", (e) => {
	e.preventDefault()
	e.stopPropagation()
	createModalEvent()
})

scheduleModalContainer?.addEventListener("submit", async (e) => {
	e.preventDefault()
	e.stopPropagation()
	try {
		newMeeting.roomName = roomNameInput.value
		newMeeting.roomId = roomIdInputModal.value
		newMeeting.password = passwordInputModal.value
		newMeeting.description = descriptionInput.value
		newMeeting.link = `${baseUrl}/?rid=${newMeeting.roomId}&pw=${newMeeting.password}`

		if (
			!newMeeting.roomName ||
			!newMeeting.roomId ||
			!newMeeting.password ||
			!newMeeting.description ||
			!newMeeting.start_date ||
			!newMeeting.end_date ||
			!Array.isArray(newMeeting.participants) ||
			newMeeting.participants.length == 0
		) {
			await Helper.showWarningModal({ message: "Please complete the form!" })
			return
		}

		const eventData = { ...newMeeting }

		const response = await fetch(`${baseUrl}/api/google`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(eventData),
		})

		const result = await response.json()

		if (result.status) {
			await Helper.showWarningModal({ message: result.message || "Failed to create meeting", status: false })
			await createModalEvent()
		} else {
			Helper.showWarningModal({ message: result.message || "Failed to create meeting" })
		}
	} catch (err) {
		console.length(err)
		Helper.showWarningModal({ message: err.message ? err.message : "Network or server error" })
	}
})

scheduleModalContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
})

scheduleModal?.addEventListener("click", (e) => {
	e.preventDefault()
	e.stopPropagation()
	createModalEvent()
})

startMeetingButton.addEventListener("click", async (e) => {
	document.getElementById("room_id").value = await Helper.generateRandomId()
	document.getElementById("password").value = await Helper.generateRandomId()
	await joinMeeting()
})

participantInput?.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && participantInput.value.trim() !== "") {
		e.preventDefault()
		const email = participantInput.value.trim()

		if (!Helper.validateEmail(email)) {
			Helper.showWarningModal({ message: "Email is not valid!" })
			return
		}
		if (newMeeting.participants.includes(email)) {
			Helper.showWarningModal({ message: "Email is already included!" })
			return
		}
		newMeeting.participants.push(email)
		addChip(email)
		participantInput.value = ""
	}
})

// modal password join meeting
const passwordContainer = document.getElementById("password-modal-container")
const incorrectPasswordContainer = document.getElementById("incorrect-password-title")
const passwordForm = document.getElementById("password-form")
const joinMeetingButton = document.getElementById("join-meeting-button-title")
const joinMeetingPasswordButton = document.getElementById("password-join-button")
const cancelPasswordButtonContainer = document.getElementById("password-cancel-button-title")

const closePasswordContainer = () => {
	passwordContainer.removeAttribute("style")
	incorrectPasswordContainer.removeAttribute("style")
}

passwordContainer.addEventListener("click", (e) => {
	e.stopPropagation()
	closePasswordContainer()
})

passwordForm.addEventListener("click", (e) => e.stopPropagation())

joinMeetingButton.addEventListener("click", (e) => {
	const language = localStorage.getItem("language")
	if (!roomId.value) {
		Helper.showWarningModal({ message: language == "en" ? "Room ID is empty" : "Room ID kosong" })
		return
	}
	passwordContainer.style.display = "flex"
})

joinMeetingPasswordButton.addEventListener("click", (e) => {
	const language = localStorage.getItem("language")
	if (!passwordInput.value) {
		incorrectPasswordContainer.style.display = "block"
		return
	}
	incorrectPasswordContainer.removeAttribute("style")
	joinMeeting()
})

cancelPasswordButtonContainer.addEventListener("click", (e) => {
	closePasswordContainer()
})

const updateDateTime = () => {
	const now = new Date()

	const timeStr = now.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	})

	const dateStr = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	})

	const offsetMinutes = now.getTimezoneOffset()
	const offsetHours = -offsetMinutes / 60
	const offsetLabel = `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`

	document.getElementById("time-now").textContent = timeStr
	document.getElementById("date-now").textContent = `${dateStr} (${offsetLabel})`
}

if (isLogin) {
	updateDateTime()
	setInterval(updateDateTime, 1000 * 60)
}
