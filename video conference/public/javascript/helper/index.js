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

			const signInFormTitle = document.getElementById("sign-in-form-title")
			const signUpFormTitle = document.getElementById("sign-up-form-title")

			const signInEmailInput = document.getElementById("sign-in-email-input")
			const signInPasswordInput = document.getElementById("sign-in-password-input")

			const signUpUsernameInput = document.getElementById("sign-up-username-input")
			const signUpEmailInput = document.getElementById("sign-up-email-input")
			const signUpPasswordInput = document.getElementById("sign-up-password-input")
			const signUpRepeatPasswordInput = document.getElementById("sign-up-repeat-password-input")

			const signInWithGoogleTitle = document.getElementById("sign-in-google-title")
			const signUpWithGoogleTitle = document.getElementById("sign-up-google-title")

			const signInTitleButton = document.getElementById("sign-in-title")
			const signUpTitleButton = document.getElementById("sign-up-title")

			const signInOrTitle = document.getElementById("sign-in-or-line-title")
			const signUpOrTitle = document.getElementById("sign-up-or-line-title")

			const signInLineTitleAccount = document.getElementById("sign-in-line-title")
			const signUpLineTitleAccount = document.getElementById("sign-up-line-title")

			const signInTitleAnchor = document.getElementById("sign-in-anchor-title")
			const signUpTitleAnchor = document.getElementById("sign-up-anchor-title")

			const signInTitleButtonHome = document.getElementById("sign-in-button-title-home")
			const signInTitleButtonNavbar = document.getElementById("sign-in-button-title-navbar")

			// OTP PAGE LANGUAGE

			const checkEmailTitle = document.getElementById("check-email-title")
			const digitVerificationTitle = document.getElementById("digit-verification-title")
			const otpReceivedTitle = document.getElementById("otp-received-title")

			// END OTP PAGE LANGUAGE

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

				if (signInFormTitle) signInFormTitle.innerHTML = "Welcome Back"
				if (signUpFormTitle) signUpFormTitle.innerHTML = "Welcome To Vmeet"

				if (signInEmailInput) signInEmailInput.placeholder = "Enter Email"
				if (signInPasswordInput) signInPasswordInput.placeholder = "Enter Password"

				if (signUpUsernameInput) signUpUsernameInput.placeholder = "Enter Username"
				if (signUpEmailInput) signUpEmailInput.placeholder = "Enter Email"
				if (signUpPasswordInput) signUpPasswordInput.placeholder = "Enter Password"
				if (signUpRepeatPasswordInput) signUpRepeatPasswordInput.placeholder = "Re Enter Password"

				if (signInWithGoogleTitle) signInWithGoogleTitle.innerHTML = "Continue With Google"
				if (signUpWithGoogleTitle) signUpWithGoogleTitle.innerHTML = "Continue With Google"

				if (signInTitleButton) signInTitleButton.innerHTML = "Sign In"
				if (signUpTitleButton) signUpTitleButton.innerHTML = "Sign Up"

				if (signInOrTitle) signInOrTitle.innerHTML = "Or"
				if (signUpOrTitle) signUpOrTitle.innerHTML = "Or"

				if (signInLineTitleAccount) signInLineTitleAccount.innerHTML = "Dont have an account?"
				if (signUpLineTitleAccount) signUpLineTitleAccount.innerHTML = "Already Have Account?"

				if (signInTitleAnchor) signInTitleAnchor.innerHTML = "Sign In"
				if (signUpTitleAnchor) signUpTitleAnchor.innerHTML = "Sign Up"

				if (signInTitleButtonHome) signInTitleButtonHome.innerHTML = "Sign In"
				if (signInTitleButtonNavbar) signInTitleButtonNavbar.innerHTML = "Sign In"

				// OTP PAGE LANGUAGE

				if (checkEmailTitle) checkEmailTitle.innerHTML = "Check Your Email"
				if (digitVerificationTitle) digitVerificationTitle.innerHTML = "Please enter six digit verification code we sent to"
				if (otpReceivedTitle) otpReceivedTitle.innerHTML = "Didn’t get the email? "

				// END OTP PAGE LANGUAGE
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

				if (signInFormTitle) signInFormTitle.innerHTML = "Selamat Datang"
				if (signUpFormTitle) signUpFormTitle.innerHTML = "Selamat Datang di Vmeet"

				if (signInEmailInput) signInEmailInput.placeholder = "Masukkan Email"
				if (signInPasswordInput) signInPasswordInput.placeholder = "Masukkan Password"

				if (signUpUsernameInput) signUpUsernameInput.placeholder = "Masukkan Username"
				if (signUpEmailInput) signUpEmailInput.placeholder = "Masukkan Email"
				if (signUpPasswordInput) signUpPasswordInput.placeholder = "Masukkan Password"
				if (signUpRepeatPasswordInput) signUpRepeatPasswordInput.placeholder = "Ulangi Password"

				if (signInWithGoogleTitle) signInWithGoogleTitle.innerHTML = "Lanjutkan Dengan Google"
				if (signUpWithGoogleTitle) signUpWithGoogleTitle.innerHTML = "Lanjutkan Dengan Google"

				if (signInTitleButton) signInTitleButton.innerHTML = "Masuk"
				if (signUpTitleButton) signUpTitleButton.innerHTML = "Daftar"

				if (signInOrTitle) signInOrTitle.innerHTML = "Atau"
				if (signUpOrTitle) signUpOrTitle.innerHTML = "Atau"

				if (signInLineTitleAccount) signInLineTitleAccount.innerHTML = "Sudah punya akun?"
				if (signUpLineTitleAccount) signUpLineTitleAccount.innerHTML = "Belum punya akun?"

				if (signInTitleAnchor) signInTitleAnchor.innerHTML = "Masuk"
				if (signUpTitleAnchor) signUpTitleAnchor.innerHTML = "Daftar"

				if (signInTitleButtonHome) signInTitleButtonHome.innerHTML = "Masuk"
				if (signInTitleButtonNavbar) signInTitleButtonNavbar.innerHTML = "Masuk"

				// OTP PAGE LANGUAGE

				if (checkEmailTitle) checkEmailTitle.innerHTML = "Check Email Anda"
				if (digitVerificationTitle) digitVerificationTitle.innerHTML = "Masukkan Kode 6 Digit yang Kami Kirim"
				if (otpReceivedTitle) otpReceivedTitle.innerHTML = "Tidak mendapatkan pesan email? "

				// END OTP PAGE LANGUAGE
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
