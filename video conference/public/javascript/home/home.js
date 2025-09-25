const { default: Swal } = require("sweetalert2")
const { getSocket } = require("../socket/socket")
const { Helper } = require("../helper")
const { DBMeeting } = require("../helper/db")

const db = new DBMeeting()
db.init()

// Parameter
const socket = getSocket(socketBaseUrl, socketPath)
const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)
const rid = params.get("rid")
const pw = params.get("pw")

// Modal on this page
const waitingModal = document.getElementById("waiting-modal-container")

const checkBoxInputPassword = document.getElementById("custom-password-checkbox")

const dropdown = document.querySelector(".dropdown")
const btn = document.querySelector(".dropdown-btn")
const selectedFlag = document.getElementById("selected-flag")
const selectedLanguage = document.getElementById("selected-language")

//
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
		const meetingInfo = document.getElementById("list-meeting-info")

		if (!meetingListContainerElement) return

		meetingListContainerElement.innerHTML = ""

		if (data.length <= 0) {
			meetingListContainerElement.innerHTML = ``
			meetingInfo.innerHTML = `${language == "en" ? "Meeting is not found" : "Meeting tidak ditemukan"}`
			return
		}

		if (data.length <= 0) {
			meetingListContainerElement.innerHTML = ``
			meetingInfo.innerHTML = `${language == "en" ? "Meeting is not found" : "Meeting tidak ditemukan"}`
			return
		}

		if (data.length <= 0) {
			meetingListContainerElement.innerHTML = ``
			meetingInfo.innerHTML = `${language == "en" ? "Meeting is not found" : "Meeting tidak ditemukan"}`
			return
		}

		let historyCount = 0
		let todayCount = 0
		let upcomingCount = 0

		const now = new Date()
		const todayStr = now.toISOString().split("T")[0]

		data.forEach((meeting) => {
			const start = new Date(meeting.startMeeting)
			const end = new Date(meeting.endMeeting)
			const meetingDateStr = start.toISOString().split("T")[0]

			if (end < now) {
				historyCount++
			} else if (meetingDateStr === todayStr) {
				todayCount++
			} else if (start > now) {
				upcomingCount++
			}
		})

		let parts = []
		if (language === "en") {
			if (historyCount > 0) parts.push(`${historyCount} meeting(s) history`)
			if (todayCount > 0) parts.push(`${todayCount} meeting(s) today`)
			if (upcomingCount > 0) parts.push(`${upcomingCount} upcoming meeting(s)`)
			meetingInfo.innerHTML = parts.length > 0 ? parts.join(", ") : "Meeting is not found"
		} else {
			if (historyCount > 0) parts.push(`${historyCount} riwayat rapat`)
			if (todayCount > 0) parts.push(`${todayCount} rapat hari ini`)
			if (upcomingCount > 0) parts.push(`${upcomingCount} rapat mendatang`)
			meetingInfo.innerHTML = parts.length > 0 ? parts.join(", ") : "Meeting tidak ditemukan"
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
							<span class="${statusClass} meeting-status">${statusLabel}</span>
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
		let isMobile = window.innerWidth <= 768

		function cb(start, end) {
			$("#list-meetings-filter span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))

			const startDate = start.format("YYYY-MM-DD")
			const endDate = end.format("YYYY-MM-DD")

			db.getList({ startDate, endDate })
				.then((result) => {
					console.log(result)
					displayMeeting({ data: result.data })
				})
				.catch((error) => {
					console.error("Error fetching Google API:", error)
				})
		}

		$("#list-meetings-filter").daterangepicker(
			{
				startDate: start,
				endDate: end,
				drops: isMobile ? "up" : "down",
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

const googleLogin = () => {
	try {
		window.location.href = databaseUrl + "/api/google/create_token"
	} catch (error) {
		console.log("- Error Login Google : ", error)
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
			passwordInputModal.value = await Helper.generateRandomId(12)
			passwordInputModal.style.backgroundColor = "#E9ECEF"
			passwordInputModal.style.cursor = "not-allowed"
			passwordInputModal.setAttribute("readonly", true)
		}
	} catch (error) {
		console.log("- Error Click Checkbox Input Password : ", error)
	}
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
		Helper.changeLanguage({ language: localStorage.getItem("language") })
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

if (localStorage.getItem("language") == "id") {
	document.getElementById("indonesian-language").click()
	dropdown.classList.remove("open")
} else {
	document.getElementById("english-language").click()
	dropdown.classList.remove("open")
}
Helper.changeLanguage({ language: localStorage.getItem("language") })

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

const googleLoginButton = document.getElementById("google-login-button")
googleLoginButton?.addEventListener("click", (e) => {
	e.stopPropagation()
	googleLogin()
})

const joinMeeting = async () => {
	try {
		const roomId = document.getElementById("room_id").value
		const password = document.getElementById("password").value
		const language = localStorage.getItem("language")

		if (!roomId || roomId.trim() == "") {
			await Helper.showWarningModal({ message: language == "en" ? "Room ID is empty" : "ID Room wajib di isi" })
			return
		}

		if (!password || password.trim() == "") {
			await Helper.showWarningModal({ message: language == "en" ? "Password ID is empty" : "Password wajib di isi" })
			return
		}

		const meeting = await db.check({ roomId, password })

		const { status, message } = meeting

		if (!status) {
			throw { message }
		}

		sessionStorage.setItem("roomId", roomId)
		sessionStorage.setItem("password", password)

		window.location.href = `${baseUrl}/lobby`
	} catch (error) {
		console.log("- error Joining room : ", error)
		if (error.message) {
			await Helper.showWarningModal({ message: error.message })
		} else {
			await Helper.showWarningModal({ message: "Internal Server Error" })
		}
	}
}

document.addEventListener("DOMContentLoaded", (e) => {
	// document.getElementById("loading-id").className = "loading-hide"
	if (rid && rid.trim() != "" && pw && pw.trim() != "") {
		passwordInput.value = pw
		roomId.value = rid
		joinMeeting()
	}

	const profileContainer = document.querySelector(".user-profile")
	const toggleCheckbox = document.getElementById("toggle-profile")

	document.addEventListener("click", (event) => {
		if (toggleCheckbox && toggleCheckbox.checked && !profileContainer.contains(event.target)) {
			toggleCheckbox.checked = false
		}
	})
})

module.exports = { joinMeeting, initMeetingDate, db }
