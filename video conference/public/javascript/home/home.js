const { default: Swal } = require("sweetalert2")
const { getSocket } = require("../socket/socket")
const url = window.location
// const baseUrl = baseUrl

const socket = getSocket(socketBaseUrl, socketPath)
const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)

const rid = params.get("rid")
const pw = params.get("pw")

// const joinForm = document.getElementById("join-form")
// const passwordForm = document.getElementById("password-form")
const passwordInput = document.getElementById("password")
const joinSubmit = document.getElementById("submit-join")
const modalTitle = document.getElementById("modal-title")
const waitingModal = document.getElementById("waiting-modal-container")
const roomId = document.getElementById("room_id")
const autoGenerateButton = document.getElementById("auto-generate")

// modal meeting list
const listMeetingModalContainer = document.getElementById("meeting-list-modal")
const listMeetingModalButton = document.getElementById("list-meeting-btn-modal")
const listMeetingModal = document.getElementById("list-meeting-id")

// modal create
const scheduleModalButton = document.getElementById("schedule-meeting-btn-modal")
const scheduleModal = document.getElementById("create-modal")
const scheduleModalContainer = document.getElementById("create-meeting-container")

const roomNameInput = document.getElementById("room_name")
const startDateTitle = document.getElementById("start_date_title")
const endDateTitle = document.getElementById("end_date_title")
const roomIdTitle = document.getElementById("room_id_create_title")
const roomIdInputModal = document.getElementById("room_id_create")
const passwordTitle = document.getElementById("password_create_title")
const passwordInputModal = document.getElementById("password_create")
const customPasswordTitle = document.getElementById("generate-pw-label")
const descriptionTitle = document.getElementById("description_title")
const descriptionInput = document.getElementById("description")
const participantTitle = document.getElementById("participants_title")
const participantInput = document.getElementById("participants")
const checkBoxInputPassword = document.getElementById("custom-password-checkbox")
const closeScheduleButton = document.getElementById("close-create-modal-button")
const closeListMeetingButton = document.getElementById("meeting-list-close-icon")

const dropdown = document.querySelector(".dropdown")
const btn = document.querySelector(".dropdown-btn")
const selectedFlag = document.getElementById("selected-flag")
const selectedLanguage = document.getElementById("selected-language")
let newMeeting = {
	roomName: "",
	start_date: undefined,
	end_date: undefined,
	roomId: "",
	password: "",
	description: "",
	participants: [],
	link: "",
}

const initMeetingDate = () => {
	try {
		$(function () {
			newMeeting.start_date = moment().add(1, "hours").toDate()
			newMeeting.end_date = moment(newMeeting.start_date).add(11, "minutes").toDate()
			$('input[name="start_date"]').daterangepicker(
				{
					singleDatePicker: true,
					showDropdowns: true,
					timePicker: true,
					timePicker24Hour: true,
					minDate: moment().add(1, "hours"),
					maxDate: moment().add(3, "months"),
					locale: {
						format: "MM/DD/YYYY HH:mm",
					},
					drops: "up",
					autoApply: true,
					showDropdowns: false,
				},
				function (start, end, label) {
					let validDate = start.toDate()
					newMeeting.start_date = validDate
					document.getElementById("end_date").removeAttribute("disabled")

					const newEndDate = moment(validDate).add(11, "minutes")

					$('input[name="end_date"]').data("daterangepicker").setStartDate(newEndDate)
					$('input[name="end_date"]').data("daterangepicker").minDate = newEndDate

					newMeeting.end_date = newEndDate.toDate()
				}
			)
		})

		$(function () {
			$('input[name="end_date"]').daterangepicker(
				{
					singleDatePicker: true,
					showDropdowns: true,
					timePicker: true,
					timePicker24Hour: true,
					minDate: moment().add(1, "hours").add(11, "minutes"),
					maxDate: moment().add(3, "months"),
					locale: {
						format: "MM/DD/YYYY HH:mm",
					},
					drops: "up",
					autoApply: true,
					showDropdowns: false,
				},
				function (start, end, label) {
					let validDate = start.toDate()
					newMeeting.end_date = validDate
				}
			)
		})
	} catch (error) {
		console.log("- Error : ", error)
	}
}

const displayMeeting = ({ data }) => {
	try {
		const meetingListContainerElement = document.getElementById("list-meeting-card-container-id")
		const language = localStorage.getItem("language")

		if (!meetingListContainerElement) return

		meetingListContainerElement.innerHTML = ""

		if (data.length <= 0) {
			meetingListContainerElement.innerHTML = `<div class="no-meeting"><img src="${baseUrl}/assets/icons/file_not_found.svg" alt="not-found" /><span>${
				language == "en" ? "Oops! There is no meeting in this period!" : "Oops! Belum ada catatan meeting di periode ini"
			}</span></div>`
			return
		}

		data.forEach((meeting) => {
			const now = new Date()
			const end = new Date(meeting.endMeeting)
			const start = new Date(meeting.startMeeting)

			const isFinished = end < now
			const statusClass = isFinished ? "green" : "orange"
			const bgClass = isFinished ? "bg-green" : "bg-orange"
			const statusLabel = isFinished ? (language == "en" ? "Completed" : "Selesai") : language == "en" ? "Upcoming" : "Mendatang"

			const timeZone = "Asia/Bangkok"
			const timeZoneLabel = "WIB"

			const formattedDate = new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
				timeZone,
			}).format(start)

			const formattedStartTime = new Intl.DateTimeFormat("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone,
			}).format(start)

			const formattedEndTime = new Intl.DateTimeFormat("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
				timeZone,
			}).format(end)

			const participantsHTML = meeting.participants.map((email) => `<span class="participant-added">${email}</span>`).join("")

			const meetingHTML = `
                <div class="card-meetings" id="meeting-card-${meeting._id}">
                    <div class="left-line ${bgClass}"></div>
						<div class="card-meeting-date">
							<img src="${baseUrl}/assets/icons/${isFinished ? "checklist" : "waiting"}.svg" class="icons-list" alt="status">
							<span>${formattedDate} ${formattedStartTime} - ${formattedEndTime} (${timeZoneLabel})</span>&nbsp;&nbsp;
							<span class="${statusClass}">${statusLabel}</span>
						</div>

                    <div>
                        <span class="meeting-list-title">${meeting.title}</span>
                    </div>
                    <div>
                        <img style="width: 10px;" src="${baseUrl}/assets/icons/info-meeting-list.svg" alt="info">
                        &nbsp;&nbsp;<span>${meeting.description}</span>
                    </div>
                    <div>
                        <img style="width: 10px;" src="${baseUrl}/assets/icons/participants-meeting-list.svg" alt="participants">
                        &nbsp;&nbsp;<span>${meeting.participants.length} Participant${meeting.participants.length > 1 ? "s" : ""}</span>
                    </div>
					<div id="pariticipant-${meeting._id}" class="participants-expandable">
						${participantsHTML}
					</div>
                    <div class="meeting-list-link">
                        <span>Link </span>&nbsp;<span class="blue" id="link-${meeting._id}">${meeting.link}</span>
                    </div>
                </div>
            `

			meetingListContainerElement.insertAdjacentHTML("beforeend", meetingHTML)
			const linkElement = document.getElementById(`link-${meeting._id}`)
			if (linkElement) {
				linkElement.style.cursor = "pointer"

				linkElement.addEventListener("click", (e) => {
					e.stopPropagation()
					navigator.clipboard.writeText(meeting.link).then(() => {
						const copiedText = document.createElement("div")
						copiedText.textContent = "Copied!"
						copiedText.className = "copied-tooltip"
						linkElement.parentElement.appendChild(copiedText)

						const rect = linkElement.getBoundingClientRect()
						copiedText.style.left = `${linkElement.offsetLeft}px`
						copiedText.style.top = `${linkElement.offsetTop - 24}px`

						setTimeout(() => {
							copiedText.remove()
						}, 1000)
					})
				})
			}

			const cardElement = document.getElementById(`meeting-card-${meeting._id}`)
			const participantSection = document.getElementById(`pariticipant-${meeting._id}`)

			cardElement.addEventListener("click", (e) => {
				if (e.target.id == `link-${meeting._id}`) return

				const isExpanded = participantSection.classList.contains("expanded")

				if (isExpanded) {
					participantSection.classList.remove("expanded")
				} else {
					participantSection.classList.add("expanded")
				}
			})
		})
	} catch (error) {
		console.error("- Error Displaying Meeting:", error)
	}
}

const initMeetingList = () => {
	try {
		let start = moment().subtract(0, "days")
		let end = moment()

		function cb(start, end) {
			$("#list-meetings-filter span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))

			const startDate = start.format("YYYY-MM-DD")
			const endDate = end.format("YYYY-MM-DD")

			fetch(`${baseUrl}/api/google?st=${startDate}&et=${endDate}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((result) => {
					displayMeeting({ data: result.data })
					console.log("Google API Response:", result)
				})
				.catch((error) => {
					console.error("Error fetching Google API:", error)
				})
		}

		$("#list-meetings-filter").daterangepicker(
			{
				startDate: start,
				endDate: end,
				ranges: {
					"Hari Ini": [moment(), moment()],
					Kemarin: [moment().subtract(1, "days"), moment().subtract(1, "days")],
					"7 Hari Terakhir": [moment().subtract(6, "days"), moment()],
					"30 Hari Terakhir": [moment().subtract(29, "days"), moment()],
					"Bulan Ini": [moment().startOf("month"), moment().endOf("month")],
					"Bulan Kemarin": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
				},
				locale: {
					customRangeLabel: "Pilih Tanggal",
				},
				showCustomRangeLabel: true,
			},
			cb
		)

		cb(start, end)
	} catch (error) {
		console.log("- Error Date Range Picker : ", error)
	}
}

if (isLogin) {
	initMeetingList()
	initMeetingDate()
}

customPasswordTitle?.addEventListener("click", () => {
	try {
		document.getElementById("custom-password-checkbox").click()
	} catch (error) {
		console.log("- Error Clicking Check Box Input : ", error)
	}
})

checkBoxInputPassword?.addEventListener("change", async () => {
	try {
		if (checkBoxInputPassword.checked) {
			passwordInputModal.value = ""
			passwordInputModal.removeAttribute("style")
			passwordInputModal.removeAttribute("readonly")
			newMeeting.password = ""
		} else {
			passwordInputModal.value = await generateRandomId(12)
			passwordInputModal.style.backgroundColor = "#E9ECEF"
			passwordInputModal.style.cursor = "not-allowed"
			passwordInputModal.setAttribute("readonly", true)
		}
	} catch (error) {
		console.log("- Error Click Checkbox Input Password : ", error)
	}
})

const createModalEvent = async () => {
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
		passwordInputModal.value = await generateRandomId()
		roomIdInputModal.value = await generateRandomId()
		scheduleModal.style.top = "0%"
	}
}

const showListModal = () => {
	if (listMeetingModalContainer.style.top == "0%") {
		listMeetingModalContainer.style.top = "-100%"
	} else {
		listMeetingModalContainer.style.top = "0%"
	}
}

closeListMeetingButton?.addEventListener("click", (e) => {
	e.stopPropagation()
	showListModal()
})

listMeetingModalContainer?.addEventListener("click", (e) => {
	e.stopPropagation()
	showListModal()
})

listMeetingModal?.addEventListener("click", (e) => {
	e.stopPropagation()
})

listMeetingModalButton?.addEventListener("click", (e) => {
	showListModal()
})

const validateEmail = (email) => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

participantInput?.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && participantInput.value.trim() !== "") {
		e.preventDefault()
		const email = participantInput.value.trim()

		if (!validateEmail(email)) {
			showWarningModal({ message: "Email is not valid!" })
			return
		}
		if (newMeeting.participants.includes(email)) {
			showWarningModal({ message: "Email is already included!" })
			return
		}
		newMeeting.participants.push(email)
		addChip(email)
		participantInput.value = ""
	}
})

closeScheduleButton?.addEventListener("click", (e) => {
	e.stopPropagation()
	e.preventDefault()
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
			await showWarningModal({ message: "Please complete the form!" })
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
			await showWarningModal({ message: result.message || "Failed to create meeting", status: false })
			await createModalEvent()
		} else {
			showWarningModal({ message: result.message || "Failed to create meeting" })
		}
	} catch (err) {
		showWarningModal({ message: "Network or server error" })
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

scheduleModalButton?.addEventListener("click", (e) => {
	e.preventDefault()
	e.stopPropagation()
	createModalEvent()
})

dropdown.addEventListener("click", (e) => {
	e.stopPropagation()
	if (dropdown.classList.contains("open")) {
		dropdown.classList.remove("open")
	} else {
		dropdown.classList.add("open")
	}
})

document.querySelectorAll(".dropdown-item").forEach((item) => {
	item.addEventListener("click", (e) => {
		e.stopPropagation()
		selectedFlag.src = item.querySelector("img").src
		if (item.dataset.lang == "Indonesian") {
			localStorage.setItem("language", "id")
			selectedLanguage.textContent = "ID"
		} else if (item.dataset.lang == "English") {
			selectedLanguage.textContent = "EN"
			localStorage.setItem("language", "en")
		}
		dropdown.classList.remove("open")
		changeLanguage({ language: localStorage.getItem("language") })
	})
})

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
	if (!dropdown.contains(e.target)) {
		dropdown.classList.remove("open")
	}
})

if (!localStorage.getItem("language")) {
	localStorage.setItem("language", "en")
} else {
	const language = localStorage.getItem("language")
	if (language !== "en" && language !== "id") {
		localStorage.setItem("language", "en")
	}
}

roomId.addEventListener("change", (e) => {
	localStorage.setItem("room_id", e.target.value)
})

document.addEventListener("DOMContentLoaded", (e) => {
	// document.getElementById("loading-id").className = "loading-hide"
	if (rid && rid.trim() != "" && pw && pw.trim() != "") {
		passwordInput.value = pw
		roomId.value = rid
		joinSubmit.click()
	}
	setFormStyle({ status: true })
})

const changeLanguage = ({ language }) => {
	try {
		const languageTitleElement = document.getElementById("language-title")
		const roomIdInput = document.getElementById("room_id")
		const passwordInput = document.getElementById("password")
		const buttonJoin = document.getElementById("submit-join")
		const autoGenerate = document.getElementById("auto-generate")

		const listMeetingModalTitle = document.getElementById("history-meeting-header-title")

		const roomNameInput = document.getElementById("room_name")
		const startDateTitle = document.getElementById("start_date_title")
		const endDateTitle = document.getElementById("end_date_title")
		const roomIdTitle = document.getElementById("room_id_title")
		const roomIdInputModal = document.getElementById("room_id_modal")
		const passwordTitle = document.getElementById("password_title")
		const passwordInputModal = document.getElementById("password_modal")
		const customPasswordTitle = document.getElementById("custom_password_title")
		const descriptionTitle = document.getElementById("description_title")
		const descriptionInput = document.getElementById("description")
		const participantTitle = document.getElementById("participant_title")
		const participantInput = document.getElementById("participants")

		const createMeetingButtonTitle = document.getElementById("meeting-create-button-title")
		const listMeetingButtonTitle = document.getElementById("meeting-list-button-title")

		const googleCalendarInfoTitle = document.getElementById("google-calendar-info-title")

		const dropdown = document.getElementById("dropdown")

		// Remove skeleton
		if (languageTitleElement) languageTitleElement.classList.remove("skeleton")

		if (language === "en") {
			if (languageTitleElement) languageTitleElement.innerHTML = `Welcome to <span>RDS Meet!</span>`
			if (roomIdInput) roomIdInput.placeholder = "Enter Room ID"
			if (passwordInput) passwordInput.placeholder = "Enter Room Password"
			if (buttonJoin) buttonJoin.innerHTML = "Join"
			if (autoGenerate) autoGenerate.innerHTML = "Auto Generate"

			if (roomNameInput) roomNameInput.placeholder = "Enter Room Name..."
			if (startDateTitle) startDateTitle.innerHTML = "Start Date"
			if (endDateTitle) endDateTitle.innerHTML = "End Date"
			if (roomIdTitle) roomIdTitle.innerHTML = "Room ID"
			if (roomIdInputModal) roomIdInputModal.placeholder = "Room ID"
			if (passwordTitle) passwordTitle.innerHTML = "Password"
			if (passwordInputModal) passwordInputModal.placeholder = "Enter your password..."
			if (customPasswordTitle) customPasswordTitle.innerHTML = "Custom Password"
			if (descriptionTitle) descriptionTitle.innerHTML = "Description"
			if (descriptionInput) descriptionInput.placeholder = "Enter your description..."
			if (participantTitle) participantTitle.innerHTML = "Participants "
			if (participantInput) participantInput.placeholder = "Add Participants..."

			if (listMeetingModalTitle) listMeetingModalTitle.innerHTML = "Meetings List"

			if (createMeetingButtonTitle) createMeetingButtonTitle.innerHTML = "Create Meeting"
			if (listMeetingButtonTitle) listMeetingButtonTitle.innerHTML = "Meeting Schedule"

			if (googleCalendarInfoTitle) googleCalendarInfoTitle.innerHTML = "Sign in to create meetings and connect with your Google Calendar"
		} else if (language === "id") {
			if (languageTitleElement) languageTitleElement.innerHTML = `Selamat Datang di <span>RDS Meet!</span>`
			if (roomIdInput) roomIdInput.placeholder = "Masukkan Room Id"
			if (passwordInput) passwordInput.placeholder = "Masukkan Password"
			if (buttonJoin) buttonJoin.innerHTML = "Masuk"
			if (autoGenerate) autoGenerate.innerHTML = "Generate Otomatis"

			if (roomNameInput) roomNameInput.placeholder = "Masukkan nama ruangan..."
			if (startDateTitle) startDateTitle.innerHTML = "Tanggal Mulai"
			if (endDateTitle) endDateTitle.innerHTML = "Tanggal Berakhir"
			if (roomIdTitle) roomIdTitle.innerHTML = "Room ID"
			if (roomIdInputModal) roomIdInputModal.placeholder = "Room ID"
			if (passwordTitle) passwordTitle.innerHTML = "Password"
			if (passwordInputModal) passwordInputModal.placeholder = "Masukkan password..."
			if (customPasswordTitle) customPasswordTitle.innerHTML = "Buat Password"
			if (descriptionTitle) descriptionTitle.innerHTML = "Deskripsi"
			if (descriptionInput) descriptionInput.placeholder = "Masukkan deskripsi..."
			if (participantTitle) participantTitle.innerHTML = "Peserta ruangan "
			if (participantInput) participantInput.placeholder = "Tambahkan peserta..."
			if (listMeetingModalTitle) listMeetingModalTitle.innerHTML = "Riwayat Meeting"

			if (createMeetingButtonTitle) createMeetingButtonTitle.innerHTML = "Buat Meeting"
			if (listMeetingButtonTitle) listMeetingButtonTitle.innerHTML = "Meeting Schedule"
			if (googleCalendarInfoTitle) googleCalendarInfoTitle.innerHTML = "Masuk untuk buat meeting dan terhubung dengan Google Calender"
		} else {
			throw new Error("Language ID is not valid")
		}

		if (dropdown && dropdown.classList.contains("open")) {
			dropdown.classList.remove("open")
		}
	} catch (error) {
		console.error("Error changing language:", error)
	}
}

if (localStorage.getItem("language") == "id") {
	document.getElementById("indonesian-language").click()
	dropdown.classList.remove("open")
} else {
	document.getElementById("english-language").click()
	dropdown.classList.remove("open")
}
changeLanguage({ language: localStorage.getItem("language") })

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

autoGenerateButton.addEventListener("click", async () => {
	try {
		const randomId = await generateRandomId()
		const randomPassword = await generateRandomId()
		document.getElementById("room_id").value = randomId
		document.getElementById("password").value = randomPassword
		if (passwordInput.value && roomId.value) {
			joinSubmit.style.color = "#ffffff"
			joinSubmit.style.backgroundColor = "#2369D1"
		} else {
			joinSubmit.style.color = "#888"
			joinSubmit.style.backgroundColor = " #ddd"
		}
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
			},
		})

		if (responseDatabaseRoom.ok) {
			const dataResponseDatabaseRoom = await responseDatabaseRoom.json()
			if (dataResponseDatabaseRoom.status) {
				localStorage.setItem("password", document.getElementById("password").value)
				localStorage.setItem("room_id", document.getElementById("room_id").value)
				localStorage.setItem("room_token", dataResponseDatabaseRoom.token)
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

// const joiningRoom = async ({ roomId, password, token, isViewer, isCameraActive, isMicActive }) => {
// 	try {
// 		socket.emit("joining-room", { position: "home", token, isViewer }, ({ status, roomName, meetingDate, meeting_type }) => {
// 			if (status) {
// 				window.location.href = baseUrl + "/room/" + roomName.replace(/\s+/g, "-")
// 			} else {
// 				if (meeting_type == 1) {
// 					window.location.href = `${baseUrl}/lobby`
// 					return
// 				}
// 				if (!meetingDate || !roomName || roomName.trim() == "") {
// 					Swal.fire({
// 						title: "Invalid Room",
// 						text: "Pastikan ID Room dan Password benar!",
// 						icon: "error",
// 					})
// 					return
// 				}
// 				let hours = new Date(meetingDate).getHours()
// 				let minutes = new Date(meetingDate).getMinutes()
// 				hours = hours < 10 ? "0" + hours : hours
// 				minutes = minutes < 10 ? "0" + minutes : minutes
// 				const timeString = `${hours}.${minutes}`
// 				setFormStyle({ status: false })
// 				modalTitle.innerHTML = roomName
// 				document.getElementById("start_date_modal").innerHTML = timeString
// 				waitingModal.classList.remove("d-none")
// 			}
// 		})
// 	} catch (error) {
// 		console.log("- Error Joining Room : ", error)
// 	}
// }

const joiningRoom = async ({ roomId, password, token, isCameraActive, isMicActive }) => {
	try {
		socket.emit("joining-room", { position: "home", token }, ({ status, roomName, meetingDate, meeting_type }) => {
			if (status) {
				window.location.href = baseUrl + "/lobby"
			} else {
				if (meeting_type == 1) {
					window.location.href = `${baseUrl}/lobby`
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

roomId.addEventListener("input", (e) => {
	localStorage.setItem("room_id", e.target.value)
	if (passwordInput.value && roomId.value) {
		joinSubmit.style.color = "#ffffff"
		joinSubmit.style.backgroundColor = "#2369D1"
	} else {
		joinSubmit.style.color = "#888"
		joinSubmit.style.backgroundColor = " #ddd"
	}
})

passwordInput.addEventListener("input", (e) => {
	localStorage.setItem("room_id", e.target.value)
	if (passwordInput.value && roomId.value) {
		joinSubmit.style.color = "#ffffff"
		joinSubmit.style.backgroundColor = "#2369D1"
	} else {
		joinSubmit.style.color = "#888"
		joinSubmit.style.backgroundColor = " #ddd"
	}
})

// document.addEventListener("DOMContentLoaded", (e) => {
// 	document.getElementById("loading-id").className = "loading-hide"
// 	if (rid && rid.trim() != "" && pw && pw.trim() != "") {
// 		passwordInput.value = pw
// 		roomId.value = rid
// 		joinSubmit.click()
// 	}
// 	setFormStyle({ status: true })
// })

const setFormStyle = async ({ status }) => {
	try {
		if (status) {
			// joinForm.removeAttribute("style")
			// passwordForm.removeAttribute("style")
			joinSubmit.removeAttribute("style")
		} else {
			// joinForm.style.position = "relative"
			// joinForm.style.zIndex = "-1"
			// passwordForm.style.position = "relative"
			// passwordForm.style.zIndex = "-1"
			joinSubmit.style.display = "none"
		}
	} catch (error) {
		console.log("- Error Set Form Style : ", error)
	}
}

const logoutButton = document.getElementById("log-out-button")
logoutButton?.addEventListener("click", async () => {
	try {
		const response = await fetch(`${baseUrl}/logout`)
		if (response.ok) {
			window.location.href = `${baseUrl}/`
		}
	} catch (error) {
		console.log("- Error Log Out Button : ", error)
	}
})

const showWarningModal = ({ message, status = true }) => {
	try {
		const warningModalElement = document.getElementById("warning-modal")
		const warningMessageElement = document.getElementById("warning-message")

		warningModalElement.classList.remove("alert-success", "alert-danger")
		warningModalElement.classList.add(status ? "alert-danger" : "alert-success")

		warningModalElement.style.top = "100px"
		warningMessageElement.innerHTML = message
		warningModalElement.style.opacity = 1
		setTimeout(() => {
			warningModalElement.style.opacity = 0
			setTimeout(() => {
				warningModalElement.style.top = "-50%"
			}, 1000)
		}, 3000)
	} catch (error) {
		console.log("- Error Show Modal : ", error)
	}
}
