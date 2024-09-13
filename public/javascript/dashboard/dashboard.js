const cards = document.querySelectorAll(".card-meetings")
const modalDetail = document.getElementById("modal-detail")
const modalCreate = document.getElementById("create-modal")
const blocker = document.getElementById("blocker")
const closeModalDetailButton = document.getElementById("close-detail-modal-button")
const closeModalCreateButton = document.getElementById("close-create-modal-button")
const newMeetingButton = document.getElementById("new-meeting")
const saveNewMeetingButton = document.getElementById("save-create-modal-button")

const baseUrl = window.location.origin

let newMeeting = {
	room_name: "",
	meeting_type: 2,
	no_perkara: "",
	start_date: undefined,
	end_date: undefined,
	location: "",
}

$(function () {
	let start = moment().subtract(0, "days")
	let end = moment()

	function cb(start, end) {
		$("#overview-meetings span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))
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
	$('input[name="start_date"]').daterangepicker(
		{
			singleDatePicker: true,
			showDropdowns: true,
			timePicker: true,
			timePicker24Hour: true,
			minDate: moment().add(1, "days"),
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
			minDate: moment().add(1, "days"),
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

newMeetingButton.addEventListener("click", () => {
	try {
		showNewMeetingModal()
	} catch (error) {
		console.log("- Error New Meeting Button : ", error)
	}
})

cards.forEach((card) => {
	card.addEventListener("click", function () {
		blocker.classList.remove("d-none")
		modalDetail.style.top = "0"
	})
})

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
const locationInput = document.getElementById("location")

roomNameInput.addEventListener("change", (event) => {
	try {
		newMeeting.room_name = event.target.value
	} catch (error) {
		console.log("- Error Input Room Name: ", error)
	}
})

locationInput.addEventListener("change", (event) => {
	try {
		newMeeting.location = event.target.value
	} catch (error) {
		console.log("- Error Input Room Name: ", error)
	}
})

saveNewMeetingButton.addEventListener("click", async () => {
	try {
		const { end_date, location, meeting_type, no_perkara, room_name, start_date } = newMeeting

		if (!room_name) {
			throw { name: "Bad Request", message: "Judul rapat wajib di isi" }
		}

		if (!meeting_type) {
			throw { name: "Bad Request", message: "Tipe rapat wajib di isi" }
		}

		if (!start_date) {
			throw { name: "Bad Request", message: "Waktu mulai wajib di isi" }
		}

		if (!end_date) {
			throw { name: "Bad Request", message: "Waktu selesai wajib di isi" }
		}

		if (!location) {
			throw { name: "Bad Request", message: "Lokasi wajib di isi" }
		}

		if (end_date <= start_date) {
			throw { name: "Bad Request", message: "Waktu selesai tidak boleh kurang dari waktu mulai" }
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
			locationInput.value = ""
			document.getElementById("start_date").value = ""
			document.getElementById("end_date").value = ""
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
