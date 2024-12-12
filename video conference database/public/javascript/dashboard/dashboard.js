const overviewContentContainer = document.getElementById("overview-content")
const foundContainer = document.getElementById("found")
const modalDetail = document.getElementById("modal-detail")
const modalCreate = document.getElementById("create-modal")
const modalDetailContainer = document.getElementById("modal-detail-container")
const modalCreateContainer = document.getElementById("create-meeting=container")
const blocker = document.getElementById("blocker")
const closeModalDetailButton = document.getElementById("close-detail-modal-button")
const closeModalCreateButton = document.getElementById("close-create-modal-button")
const newMeetingButton = document.getElementById("new-meeting")
const saveNewMeetingButton = document.getElementById("save-create-modal-button")
const checkBoxCustomPassword = document.getElementById("generate-pw-label")
const checkBoxInputPassword = document.getElementById("custom-password-checkbox")
const passwordInput = document.getElementById("password")
const meetingTypeInput = document.getElementById("meeting_type")
const faceRecognitionInput = document.getElementById("face_recognition")
const participantsOptionContainer = document.getElementById("input-meeting-participants")
const participantListPublicContainer = document.getElementById("public-declaration")
const noPerkaraInput = document.getElementById("no_perkara")

const roomNameDetail = document.getElementById("detail_room_name")
const noPerkaraDetail = document.getElementById("detail_no_perkara")
const meetingTypeDetail = document.getElementById("detail_meeting_type")
const startTimeDetail = document.getElementById("detail_start_time")
const startDateDetail = document.getElementById("detail_start_date")
const endTimeDetail = document.getElementById("detail_end_time")
const endDateDetail = document.getElementById("detail_end_date")
const noteDetail = document.getElementById("detail_note")
const roomIdDetail = document.getElementById("detail_room_id")
const passwordDetail = document.getElementById("detail_password")
const faceRecognitionDetail = document.getElementById("detail_face_recognition")
const participantsListDetail = document.getElementById("detail_participant_list")
const clipboardDetail = document.getElementById("clipboard-button")

document.addEventListener("DOMContentLoaded", (e) => {
	document.getElementById("loading-id").className = "loading-hide"
})

$(function () {
	$("#participants").chosen({
		search_contains: true,
		max_shown_results: 5,
		placeholder_text_multiple: "Pilih peserta",
		no_results_text: "Peserta tidak ditemukan",
	})
	if (!participantsOptionContainer.classList.contains("d-none")) {
		participantsOptionContainer.classList.add("d-none")
	}
})

const copyClipboard = async () => {
	try {
		await navigator.clipboard.writeText(`${applicationUrl}/?rid=${roomIdDetail.innerHTML}&pw=${passwordDetail.innerHTML}`)

		const clipboardSuccess = document.getElementById("clipboard-success")

		clipboardSuccess.style.opacity = 1
		setTimeout(() => {
			clipboardSuccess.removeAttribute("style")
		}, 2000)
	} catch (error) {
		console.log("- Error Copy Clipboard : ", error)
	}
}

const formatDate = (date) => {
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)

	const tomorrow = new Date(today)
	tomorrow.setDate(today.getDate() + 1)

	const todayString = today.toDateString()
	const yesterdayString = yesterday.toDateString()
	const tomorrowString = tomorrow.toDateString()
	const dateString = date.toDateString()

	if (dateString == todayString) {
		return "Hari Ini"
	} else if (dateString == yesterdayString) {
		return "Kemarin"
	} else if (dateString == tomorrowString) {
		return "Besok"
	} else {
		const day = String(date.getDate()).padStart(2, "0")
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const year = date.getFullYear()
		return `${day} ${month} ${year}`
	}
}

const formatTime = (date) => {
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	return `${hours}.${minutes}`
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

const initialPassword = generateRandomId(12)

const baseUrl = window.location.origin

let newMeeting = {
	room_name: "",
	meeting_type: 2,
	no_perkara: "",
	start_date: undefined,
	end_date: undefined,
	note: "",
	password: initialPassword,
	participants: [],
	face_recognition: false,
}
passwordInput.value = initialPassword

$(function () {
	let start = moment().subtract(0, "days")
	let end = moment()

	function cb(start, end) {
		$("#overview-meetings span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))

		const startDate = start.format("YYYY-MM-DD")
		const endDate = end.format("YYYY-MM-DD")

		fetch(`${baseUrl}/api/room?st=${startDate}&et=${endDate}`)
			.then((response) => {
				if (response.ok) {
					return response.json()
				}
			})
			.then((meeting) => {
				const { data } = meeting
				meetingsInfo = data
				if (meetingsInfo.length == 0) {
					overviewContentContainer.innerHTML = "-"
					foundContainer.innerHTML = "Tidak ada jadwal persidangan"
				} else {
					let template = ""
					meetingsInfo.forEach((m) => {
						template += `
						<div class="card-meetings" id="${m.room_id}-${m.meeting_type}">
                                    <div class="left-line"></div>
                                    <div>
                                        <span>Tipe Rapat :  ${m.meeting_type == 1 ? "Perkara" : "Non Perkara"}</span>
										&nbsp;&nbsp;&nbsp;&nbsp;
										<span>No. Perkara : ${m.no_perkara ? m.no_perkara : "-"} </span>
                                    </div>
                                    <div>
                                        <h3>${m.room_name}</h3>
                                    </div>
                                    <div>
                                        <hr>
                                    </div>
                                    <div>
                                        <img style="width: 10px;" src="/assets/icons/date-icon.svg" alt="calender" srcset="">
										&nbsp;&nbsp;
										<span>${formatDate(new Date(m.start_date))}</span>
                                    </div>
                                    <div>
                                        <img style="width: 10px;" src="/assets/icons/clock_meeting.svg" alt="clock" srcset="">&nbsp;&nbsp;
										<span>${formatTime(new Date(m.start_date))} - ${formatTime(new Date(m.end_date))}</span>
                                    </div>
                                    <div>
                                        <img style="width: 10px;" src="/assets/icons/note.svg" alt="note" srcset="">&nbsp;&nbsp;
										<span>${m.note || m.note.trim() != "" ? m.note : "-"}</span>
                                    </div>
                                    <div>
                                        <img style="width: 10px;" src="/assets/icons/participant_meeting.svg" alt="participant" srcset="">&nbsp;&nbsp;<span>
                                            ${m.meeting_type == 1 ? `${m.participants.length} Peserta` : "Publik"}
                                            </span>
                                    </div>
                            </div>
						`
					})
					overviewContentContainer.innerHTML = template
					foundContainer.innerHTML = meetingsInfo.length != 0 ? `${meetingsInfo.length} jadwal persidangan ditemukan` : "Tidak ada jadwal persidangan"
					return meetingsInfo
				}
			})
			.then((_) => {
				functionShowDetail()
			})
			.catch((error) => {
				console.log("- Error Fetching Filter Meeting : ", error)
			})
	}

	$("#overview-meetings").daterangepicker(
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
})

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
			$('input[name="end_date"]').data("daterangepicker").setStartDate(moment(validDate).add(11, "minutes"))
			$('input[name="end_date"]').data("daterangepicker").minDate = moment(validDate).add(11, "minutes")
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

closeModalDetailButton.addEventListener("click", () => {
	try {
		if (!blocker.classList.contains("d-none")) {
			blocker.classList.add("d-none")
		}
		modalDetail.style.top = "-100%"
	} catch (error) {
		console.log("- Error Close Detail Modal : ", error)
	}
})

closeModalCreateButton.addEventListener("click", () => {
	try {
		if (!blocker.classList.contains("d-none")) {
			blocker.classList.add("d-none")
		}
		modalCreate.style.top = "-100%"
	} catch (error) {
		console.log("- Error Close Detail Modal : ", error)
	}
})

const showCreateModal = () => {
	try {
		if (!blocker.classList.contains("d-none")) {
			blocker.classList.add("d-none")
		}
		modalCreate.style.top = "0%"
	} catch (error) {
		console.log("- Error Show Create Modal : ", error)
	}
}

const showNewMeetingModal = () => {
	try {
		blocker.classList.remove("d-none")
		modalCreate.style.top = "0"
	} catch (error) {
		console.log("- Error Show New Meeting Modal : ", error)
	}
}

newMeetingButton.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		showNewMeetingModal()
	} catch (error) {
		console.log("- Error New Meeting Button : ", error)
	}
})

const functionShowDetail = async () => {
	try {
		const cards = document.querySelectorAll(".card-meetings")
		cards.forEach((card) => {
			card.addEventListener("click", async (e) => {
				try {
					e.stopPropagation()
					const selectedRoomId = card.id
					const parts = selectedRoomId.split("-")
					blocker.classList.remove("d-none")
					modalDetail.style.top = "0"

					const roomDetail = meetingsInfo.find((m) => m.room_id == parts[0])

					const { no_perkara, end_date, start_date, meeting_type, room_id, room_name, password, note, participants, face_recognition } = roomDetail

					const startDate = await formatDate(new Date(start_date))
					const endDate = await formatDate(new Date(end_date))

					const startTime = await formatTime(new Date(start_date))
					const endTime = await formatTime(new Date(end_date))

					roomNameDetail.innerHTML = room_name
					noPerkaraDetail.innerHTML = !no_perkara || no_perkara.trim() == "" ? "-" : no_perkara
					meetingTypeDetail.innerHTML = meeting_type == 1 ? "Perkara" : "Non Perkara"
					startTimeDetail.innerHTML = startDate
					startDateDetail.innerHTML = startTime
					endTimeDetail.innerHTML = endDate
					endDateDetail.innerHTML = endTime
					noteDetail.innerHTML = note || note.trim() != "" ? note : "-"
					roomIdDetail.innerHTML = room_id
					passwordDetail.innerHTML = password
					faceRecognitionDetail.innerHTML = face_recognition ? "Ya" : "Tidak"

					clipboardDetail.removeEventListener("click", copyClipboard)
					clipboardDetail.addEventListener("click", copyClipboard)

					participantsListDetail.style.display = "none"
					participantListPublicContainer.classList.remove("d-none")
					if (parts[1] == 1) {
						let participantList = ``
						participants.forEach((p, index) => {
							let addParticipant = `
							<tr>
								<td>${index + 1}</td>
								<td>${p.participant_id}</td>
								<td>${p.full_name}</td>
								<td>${p.role}</td>
							</tr>
							`

							participantList += addParticipant
						})

						participantsListDetail.innerHTML = participantList

						participantsListDetail.removeAttribute("style")
						if (!participantListPublicContainer.classList.contains("d-none")) {
							participantListPublicContainer.classList.add("d-none")
						}
					} else if (parts[1] == 2) {
						participantsListDetail.style.display = "none"
						participantListPublicContainer.classList.remove("d-none")
					}
				} catch (error) {
					console.log("- Error Add Event Listener Card : ", error)
				}
			})
		})
	} catch (error) {
		console.log("- Error Show Detail Card : ", error)
	}
}

functionShowDetail()

setInterval(() => {
	const formattedDate = new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(new Date())
	document.getElementById("live-clock").innerHTML = new Date().toLocaleTimeString()
	document.getElementById("live-date").innerHTML = formattedDate
}, 1000)

// Input new meetings
const roomNameInput = document.getElementById("room_name")
const noteInput = document.getElementById("note")

roomNameInput.addEventListener("change", (event) => {
	try {
		newMeeting.room_name = event.target.value
	} catch (error) {
		console.log("- Error Input Room Name: ", error)
	}
})

noteInput.addEventListener("change", (event) => {
	try {
		newMeeting.note = event.target.value
	} catch (error) {
		console.log("- Error Input Room Name: ", error)
	}
})

saveNewMeetingButton.addEventListener("click", async () => {
	try {
		newMeeting.password = passwordInput.value
		newMeeting.participants = $("#participants").chosen().val()
		newMeeting.no_perkara = noPerkaraInput.value
		newMeeting.meeting_type = meetingTypeInput.value
		newMeeting.face_recognition = faceRecognitionInput.value === "true"
		if (newMeeting.meeting_type == 2) {
			newMeeting.no_perkara = ""
		}
		const { end_date, note, meeting_type, no_perkara, room_name, start_date, password, participants, face_recognition } = newMeeting

		if (!room_name && room_name.trim() == "") {
			throw { name: "Bad Request", message: "Judul rapat wajib di isi" }
		}

		if (!meeting_type) {
			throw { name: "Bad Request", message: "Tipe rapat wajib di isi" }
		}

		if (meeting_type == 1 && (!no_perkara || no_perkara.trim() == "")) {
			throw { name: "Bad Request", message: "No perkara wajib di isi untuk Sidang Perkara" }
		}

		if (!start_date) {
			throw { name: "Bad Request", message: "Waktu mulai wajib di isi" }
		}

		if (!end_date) {
			throw { name: "Bad Request", message: "Waktu selesai wajib di isi" }
		}

		if (end_date <= start_date) {
			throw { name: "Bad Request", message: "Waktu selesai tidak boleh kurang dari waktu mulai" }
		}

		if (!password && password.trim() == "") {
			throw { name: "Bad Request", message: "Password wajib di isi" }
		}

		if (meeting_type == 1 && participants.length < 2) {
			throw { name: "Bad Request", message: "Minimal 2 peserta yang ikut rapat" }
		}

		const differenceInMinutes = (end_date.getTime() - start_date.getTime()) / (1000 * 60)

		// Meeting atleast 10 minutes
		if (differenceInMinutes < 10) {
			throw { name: "Bad Request", message: "Minimal durasi meeting adalah 10 menit" }
		}

		const postRooms = await fetch(`${baseUrl}/api/room`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newMeeting),
		})
		if (postRooms.status) {
			await showSuccessModal({ message: "Rapat berhasil dibuat" })
			await closeModalCreateButton.click()
			roomNameInput.value = ""
			noteInput.value = ""
			document.getElementById("start_date").value = ""
			document.getElementById("end_date").value = ""
			setTimeout(() => {
				window.location.href = `${baseUrl}`
			}, 2000)
		} else {
			throw { name: "Bad Request", message: "Rapat gagal dibuat" }
		}
	} catch (error) {
		console.log("- Error Save New Meeting : ", error)
		showWarningModal({ message: error.message })
	}
})

const showWarningModal = ({ message }) => {
	try {
		const warningModalElement = document.getElementById("warning-modal")
		const warningMessageElement = document.getElementById("warning-message")
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

const showSuccessModal = ({ message }) => {
	try {
		const successModalElement = document.getElementById("success-modal")
		const successMessageElement = document.getElementById("success-message")
		successModalElement.style.top = "100px"
		successMessageElement.innerHTML = message
		successModalElement.style.opacity = 1
		setTimeout(() => {
			successModalElement.style.opacity = 0
			setTimeout(() => {
				successModalElement.style.top = "-50%"
			}, 1000)
		}, 3000)
	} catch (error) {
		console.log("- Error Show Modal : ", error)
	}
}

checkBoxCustomPassword.addEventListener("click", () => {
	try {
		document.getElementById("custom-password-checkbox").click()
	} catch (error) {
		console.log("- Error Clicking Check Box Input : ", error)
	}
})

checkBoxInputPassword.addEventListener("change", async () => {
	try {
		if (checkBoxInputPassword.checked) {
			passwordInput.value = ""
			passwordInput.removeAttribute("style")
			passwordInput.removeAttribute("readonly")
			newMeeting.password = ""
		} else {
			passwordInput.value = await generateRandomId(12)
			passwordInput.style.backgroundColor = "#E9ECEF"
			passwordInput.style.cursor = "not-allowed"
			passwordInput.setAttribute("readonly", true)
		}
	} catch (error) {
		console.log("- Error Click Checkbox Input Password : ", error)
	}
})

meetingTypeInput.addEventListener("change", (e) => {
	try {
		const meetingType = e.target.value
		newMeeting.meeting_type = meetingType

		// console.log($("#participants").chosen().val())

		if (meetingType == 1) {
			participantsOptionContainer.classList.remove("d-none")
			noPerkaraInput.removeAttribute("style")
			noPerkaraInput.removeAttribute("readonly")
			noPerkaraInput.value = ""
			newMeeting.no_perkara = ""
		} else if (meetingType == 2) {
			if (!participantsOptionContainer.classList.contains("d-none")) {
				participantsOptionContainer.classList.add("d-none")
			}
			noPerkaraInput.value = "-"
			noPerkaraInput.style.backgroundColor = "#E9ECEF"
			noPerkaraInput.style.cursor = "not-allowed"
			noPerkaraInput.setAttribute("readonly", true)
			newMeeting.no_perkara = ""
			$("#participants").val("").trigger("chosen:updated")
		}
	} catch (error) {
		console.log("- Error Onchange Meeting Type : ", error)
	}
})

clipboardDetail.addEventListener("click", copyClipboard)

noPerkaraInput.addEventListener("input", (e) => {
	try {
		newMeeting.no_perkara = e.target.value
	} catch (error) {
		console.log("- Error No Perkara Input : ", error)
	}
})

modalCreateContainer.addEventListener("click", (e) => {
	e.stopPropagation()
})

modalDetailContainer.addEventListener("click", (e) => {
	e.stopPropagation()
})

document.addEventListener("click", (e) => {
	try {
		e.stopPropagation()
		if (!blocker.classList.contains("d-none")) {
			blocker.classList.add("d-none")
		}
		if (modalCreate.style.top != "-100%") {
			modalCreate.style.top = "-100%"
		}
		if (modalDetail.style.top != "-100%") {
			modalDetail.style.top = "-100%"
		}
	} catch (error) {
		console.log("- Error Closing From Blocker : ", error)
	}
})
$(document).ready(function () {
    const elements = document.getElementsByClassName("daterangepicker");
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
});
