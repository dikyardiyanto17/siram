class Helper {
	static async generateRandomId(length = 12, separator = "-", separatorInterval = 4) {
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

	static async showWarningModal({ message, status = true }) {
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

	static async changeLanguage({ language }) {
		try {
			const languageTitleElement = document.getElementById("language-title")
			const languageDescriptionTitle = document.getElementById("language-description")
			const languageTitle2Element = document.getElementById("language-2-title")
			const languageDescription2Title = document.getElementById("language-2-description")
			const languageJoinMeetingTitle = document.getElementById("language-join-meeting")
			const joinMeetingButtonTitle = document.getElementById("join-meeting-button-title")
			const roomIdInput = document.getElementById("room_id")
			const passwordInput = document.getElementById("password")
			const buttonJoin = document.getElementById("submit-join")
			// const autoGenerate = document.getElementById("auto-generate")

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

			const incorrectPasswordTitle = document.getElementById("incorrect-password-title")
			const cancelPasswordButtonTitle = document.getElementById("password-cancel-button-title")
			const joinPasswordButtonTitle = document.getElementById("password-join-button")

			const createMeetingButtonTitle = document.getElementById("meeting-create-button-title")
			const listMeetingButtonTitle = document.getElementById("meeting-list-button-title")

			const googleCalendarInfoTitle = document.getElementById("google-calendar-info-title")

			const dropdown = document.getElementById("dropdown")

			// Remove skeleton
			if (languageTitleElement) languageTitleElement.classList.remove("skeleton")

			if (language === "en") {
				if (languageTitleElement) languageTitleElement.innerHTML = `All Your Meetings in One Place`
				if (languageDescriptionTitle)
					languageDescriptionTitle.innerHTML = `Schedule new meetings, view past or upcoming sessions, and invite participants effortlessly.`
				if (languageJoinMeetingTitle) languageJoinMeetingTitle.innerHTML = "Join a Meeting"
				if (joinMeetingButtonTitle) joinMeetingButtonTitle.innerHTML = "Join"
				if (languageTitle2Element) languageTitle2Element.innerHTML = "Smart meetings, anytime, anywhere"
				if (languageDescription2Title)
					languageDescription2Title.innerHTML =
						"From meetings to catch-ups, enjoy crystal-clear video calls that keep you connected anytime, anywhere."
				if (roomIdInput) roomIdInput.placeholder = "Enter Room ID"
				if (passwordInput) passwordInput.placeholder = "Enter Room Password"
				if (buttonJoin) buttonJoin.innerHTML = "Join"
				// if (autoGenerate) autoGenerate.innerHTML = "Auto Generate"

				if (incorrectPasswordTitle) incorrectPasswordTitle.innerHTML = "Incorrect Passord!"
				if (cancelPasswordButtonTitle) cancelPasswordButtonTitle.innerHTML = "Cancel"
				if (joinPasswordButtonTitle) joinPasswordButtonTitle.innerHTML = "Join"

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

				if (createMeetingButtonTitle) createMeetingButtonTitle.innerHTML = "Start Meeting"
				if (listMeetingButtonTitle) listMeetingButtonTitle.innerHTML = "Meeting Schedule"

				if (googleCalendarInfoTitle) googleCalendarInfoTitle.innerHTML = "Sign in to create meetings and connect with your Google Calendar"
			} else if (language === "id") {
				if (languageTitleElement) languageTitleElement.innerHTML = `Semua Meeting Anda di Satu Tempat`
				if (languageDescriptionTitle)
					languageDescriptionTitle.innerHTML = `Buat jadwal meeting, lihat riwayat atau meeting mendatang, dan undang peserta dengan mudah`
				if (languageJoinMeetingTitle) languageJoinMeetingTitle.innerHTML = "Masuk Ruangan"
				if (joinMeetingButtonTitle) joinMeetingButtonTitle.innerHTML = "Masuk"
				if (languageTitle2Element) languageTitle2Element.innerHTML = "Meeting cepat, kapan pun dan dimanapun"
				if (languageDescription2Title)
					languageDescription2Title.innerHTML =
						"Dari rapat hingga obrolan santai, nikmati panggilan video jernih yang membuatmu tetap terhubung kapan saja, di mana saja."
				if (roomIdInput) roomIdInput.placeholder = "Masukkan Room Id"
				if (passwordInput) passwordInput.placeholder = "Masukkan Password"
				if (buttonJoin) buttonJoin.innerHTML = "Masuk"
				// if (autoGenerate) autoGenerate.innerHTML = "Generate Otomatis"

				if (incorrectPasswordTitle) incorrectPasswordTitle.innerHTML = "Password salah!"
				if (cancelPasswordButtonTitle) cancelPasswordButtonTitle.innerHTML = "Batalkan"
				if (joinPasswordButtonTitle) joinPasswordButtonTitle.innerHTML = "Masuk"

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

				if (createMeetingButtonTitle) createMeetingButtonTitle.innerHTML = "Mulai Meeting"
				if (listMeetingButtonTitle) listMeetingButtonTitle.innerHTML = "Jadwalkan Meeting"
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

	static async validateEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	}
}

module.exports = { Helper }
