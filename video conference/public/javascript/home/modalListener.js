const { Helper } = require("../helper")
const { joinMeeting, initMeetingDate, db } = require("./home")

/* ================================
   DOM ELEMENTS
================================ */
const els = {
	// Meeting list modal
	listMeetingModalContainer: document.getElementById("meeting-list"),
	listMeetingModalButton: document.getElementById("list-meeting-btn-modal"),
	listMeetingModal: document.getElementById("list-meeting-id"),

	// Create meeting modal
	scheduleModalButton: document.getElementById("schedule-meeting-btn-modal"),
	startMeetingButton: document.getElementById("start-meeting-btn-modal"),
	scheduleModal: document.getElementById("create-modal"),
	scheduleModalContainer: document.getElementById("create-meeting-container-form"),
	participantInput: document.getElementById("participants"),
	closeScheduleButton: document.getElementById("close-create-modal-button"),

	// Sign in modal
	signInModalContainer: document.getElementById("sign-in-container"),
	signInForm: document.getElementById("sign-in-form"),
	signUpForm: document.getElementById("sign-up-form"),
	signInLineTitle: document.getElementById("sign-in-anchor-title"),
	signUpLineTitle: document.getElementById("sign-up-anchor-title"),

	// Password modal
	passwordContainer: document.getElementById("password-modal-container"),
	incorrectPasswordContainer: document.getElementById("incorrect-password-title"),
	passwordForm: document.getElementById("password-form"),
	joinMeetingButton: document.getElementById("join-meeting-button-title"),
	joinMeetingPasswordButton: document.getElementById("password-join-button"),
	cancelPasswordButtonContainer: document.getElementById("password-cancel-button-title"),
}

/* ================================
   HELPERS
================================ */
const toggleModal = (el, isOpen) => {
	el.style.top = isOpen ? "0%" : "-100%"
}

const clearCreateMeetingForm = async () => {
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
}

const addChip = (email) => {
	const participantsBox = document.getElementById("participants-box-id")
	const chip = document.createElement("span")
	chip.classList.add("participant-added")
	chip.innerHTML = `${email} <i class="fa-solid fa-xmark delete-added" id="chip-${email}"></i>`
	participantsBox.appendChild(chip)

	const deleteChip = chip.querySelector(`#chip-${email}`)
	deleteChip.addEventListener("click", (e) => {
		e.preventDefault()
		newMeeting.participants = newMeeting.participants.filter((x) => x !== email)
		chip.remove()
	})
}

/* ================================
   MEETING LIST MODAL
================================ */
els.listMeetingModalButton?.addEventListener("click", () => {
	toggleModal(els.listMeetingModalContainer, els.listMeetingModalContainer.style.top !== "0%")
})

els.listMeetingModalContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
	toggleModal(els.listMeetingModalContainer, false)
})

els.listMeetingModal?.addEventListener("click", (e) => e.stopPropagation())

/* ================================
   CREATE MEETING MODAL
================================ */
const createModalEvent = async () => {
	if (!isLogin) return
	if (els.scheduleModal.style.top === "0%") {
		toggleModal(els.scheduleModal, false)
		await clearCreateMeetingForm()
	} else {
		passwordInputModal.value = await Helper.generateRandomId()
		roomIdInputModal.value = await Helper.generateRandomId()
		toggleModal(els.scheduleModal, true)
	}
}

els.scheduleModalButton?.addEventListener("click", (e) => {
	e.preventDefault()
	e.stopPropagation()
	createModalEvent()
})

els.scheduleModalContainer?.addEventListener("click", (e) => e.stopPropagation())

els.scheduleModalContainer?.addEventListener("submit", async (e) => {
	e.preventDefault()
	e.stopPropagation()

	try {
		newMeeting = {
			...newMeeting,
			roomName: roomNameInput.value,
			roomId: roomIdInputModal.value,
			password: passwordInputModal.value,
			description: descriptionInput.value,
			link: `${baseUrl}/?rid=${roomIdInputModal.value}&pw=${passwordInputModal.value}`,
		}

		if (
			!newMeeting.roomName ||
			!newMeeting.roomId ||
			!newMeeting.password ||
			!newMeeting.description ||
			!newMeeting.start_date ||
			!newMeeting.end_date ||
			!newMeeting.participants?.length
		) {
			return Helper.showWarningModal({ message: "Please complete the form!" })
		}

		const response = await fetch(`${baseUrl}/api/google`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newMeeting),
		})

		const result = await response.json()
		if (result.status) {
			await Helper.showWarningModal({ message: result.message || "Failed to create meeting", status: false })
			await createModalEvent()
		} else {
			Helper.showWarningModal({ message: result.message || "Failed to create meeting" })
		}
	} catch (err) {
		Helper.showWarningModal({ message: err.message || "Network or server error" })
	}
})

els.closeScheduleButton?.addEventListener("click", (e) => {
	e.stopPropagation()
	e.preventDefault()
	createModalEvent()
})

els.startMeetingButton?.addEventListener("click", async () => {
	document.getElementById("room_id").value = await Helper.generateRandomId()
	document.getElementById("password").value = await Helper.generateRandomId()
	await joinMeeting()
})

els.participantInput?.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && els.participantInput.value.trim() !== "") {
		e.preventDefault()
		const email = els.participantInput.value.trim()

		if (!Helper.validateEmail(email)) return Helper.showWarningModal({ message: "Email is not valid!" })
		if (newMeeting.participants.includes(email)) return Helper.showWarningModal({ message: "Email is already included!" })

		newMeeting.participants.push(email)
		addChip(email)
		els.participantInput.value = ""
	}
})

/* ================================
   PASSWORD MODAL
================================ */
const closePasswordContainer = () => {
	els.passwordContainer.removeAttribute("style")
	els.incorrectPasswordContainer.removeAttribute("style")
}

els.passwordContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
	closePasswordContainer()
})

els.passwordForm?.addEventListener("click", (e) => e.stopPropagation())

els.joinMeetingButton?.addEventListener("click", () => {
	const language = localStorage.getItem("language")
	if (!roomId.value) {
		return Helper.showWarningModal({ message: language === "en" ? "Room ID is empty" : "Room ID kosong" })
	}
	els.passwordContainer.style.display = "flex"
})

els.joinMeetingPasswordButton?.addEventListener("click", () => {
	if (!passwordInput.value) {
		els.incorrectPasswordContainer.style.display = "block"
		return
	}
	els.incorrectPasswordContainer.removeAttribute("style")
	joinMeeting()
})

els.cancelPasswordButtonContainer?.addEventListener("click", closePasswordContainer)

/* ================================
   DATE & TIME
================================ */
const updateDateTime = () => {
	const now = new Date()
	const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: true })
	const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
	const offsetHours = -now.getTimezoneOffset() / 60
	const offsetLabel = `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`

	document.getElementById("time-now").textContent = timeStr
	document.getElementById("date-now").textContent = `${dateStr} (${offsetLabel})`
}

if (isLogin) {
	updateDateTime()
	setInterval(updateDateTime, 60 * 1000)
}

/* ================================
   SIGN IN / SIGN UP MODAL
================================ */
const signInSignUpForm = ({ isSignIn }) => {
	els.signInForm.classList.toggle("d-none", !isSignIn)
	els.signUpForm.classList.toggle("d-none", isSignIn)
}

const closeSignInContainer = () => {
	els.signInModalContainer.removeAttribute("style")
	signInSignUpForm({ isSignIn: true })
}

els.signInForm?.addEventListener("click", (e) => e.stopPropagation())
els.signUpForm?.addEventListener("click", (e) => e.stopPropagation())
els.signUpForm?.addEventListener("submit", async (e) => {
	await e.preventDefault()
	await e.stopPropagation()
	try {
		const signUpEmailInput = document.getElementById("sign-up-email-input")
		const signUpUsernameInput = document.getElementById("sign-up-username-input")
		const signUpPasswordInput = document.getElementById("sign-up-password-input")
		const signUpRepeatedPasswordInput = document.getElementById("sign-up-repeat-password-input")

		const data = {
			email: signUpEmailInput.value,
			username: signUpUsernameInput.value,
			password: signUpPasswordInput.value,
			repeatedPassword: signUpRepeatedPasswordInput.value,
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

		if (!data.email || !data.username || !data.password || !data.repeatedPassword) {
			throw { name: "Bad Request", message: "Please Complete the form" }
		}

		if (!passwordRegex.test(data.password)) {
			throw { name: "Bad Request", message: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and symbol" }
		}

		if (data.password != data.repeatedPassword) {
			throw { name: "Bad Request", message: "Password and repeated password do not match" }
		}

		const response = await db.register(data)

		if (!response.status) {
			throw { message: response.message }
		}

		window.location.href = response.data[0].link
	} catch (error) {
		await Helper.showWarningModal({ message: error?.message || "Something went wrong" })
	}
})

els.signInForm?.addEventListener("submit", async (e) => {
	await e.preventDefault()
	await e.stopPropagation()
	try {
		const signInEmailInput = document.getElementById("sign-in-email-input")
		const signInPasswordInput = document.getElementById("sign-in-password-input")

		const data = {
			email: signInEmailInput.value,
			password: signInPasswordInput.value,
		}

		if (!data.email || !data.password) {
			throw { name: "Bad Request", message: "Please Complete the form" }
		}

		const response = await db.login(data)

		if (!response.status) {
			throw { message: response.message }
		}

		window.location.href = baseUrl
	} catch (error) {
		await Helper.showWarningModal({ message: error?.message || "Something went wrong" })
	}
})

els.signInLineTitle?.addEventListener("click", () => signInSignUpForm({ isSignIn: true }))
els.signUpLineTitle?.addEventListener("click", () => signInSignUpForm({ isSignIn: false }))

els.signInModalContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
	closeSignInContainer()
})

Array.from(document.getElementsByClassName("sign-in-btn")).forEach((btn) => {
	btn.addEventListener("click", () => {
		els.signInModalContainer.style.display = "flex"
		signInSignUpForm({ isSignIn: true })
	})
})
