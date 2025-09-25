(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class DBMeeting {
	#api = {
		chat: "chat",
		api: "api",
		meeting: "meeting",
		file: "file",
		auth: "auth",
		register: "register",
		login: "login",
		otp: "otp",
	}

	#getMeetingsApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.meeting}`,
		method: "GET",
	}

	#getDetailMeetingsApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.meeting}`,
		method: "GET",
	}

	#getUpdateMeetingsApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.meeting}`,
		method: "PUT",
	}

	#getCheckMeetingApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.meeting}/check-meeting`,
		method: "GET",
	}

	#postFilesApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.file}`,
		method: "POST",
	}

	#postMeetingsApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.meeting}`,
		method: "POST",
	}

	#postChatsApi = {
		url: `${databaseUrl}/${this.#api.api}/${this.#api.chat}`,
		method: "POST",
	}

	#postRegisterApi = {
		url: `${databaseUrl}/${this.#api.auth}/${this.#api.register}`,
		method: "POST",
	}

	#posLoginApi = {
		url: `${databaseUrl}/${this.#api.auth}/${this.#api.login}`,
		method: "POST",
	}

	#postOtpApi = {
		url: `${databaseUrl}/${this.#api.auth}/${this.#api.otp}`,
		method: "POST",
	}

	#getResendOtpApi = {
		url: `${databaseUrl}/${this.#api.auth}/${this.#api.otp}/resend`,
		method: "GET",
	}

	async init() {
		console.log("Success initialized DBMeeting from client!")
		return "Success initialized DBMeeting from client!"
	}

	async #get() {
		try {
			const response = await fetch(this.#getMeetingsApi.url, {
				method: this.#getMeetingsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			const meeting = await response.json()
			return meeting
		} catch (error) {
			console.log("DBMeeting.#get error:", error)
			return { status: false, data: [{ ...error }] }
		}
	}

	async #getList({ startDate, endDate }) {
		try {
			const response = await fetch(this.#getMeetingsApi.url + `?st=${startDate}&et=${endDate}`, {
				method: this.#getMeetingsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			const meeting = await response.json()
			return meeting
		} catch (error) {
			console.log("DBMeeting.#get error:", error)
			return { status: false, data: [{ ...error }] }
		}
	}

	async #put(data) {
		try {
			const roomId = await this.getCookie("roomId")

			if (!roomId) {
				throw { status: false, data: [], message: "Room id is empty!" }
			}

			const response = await fetch(`${this.#getUpdateMeetingsApi.url}`, {
				method: this.#getUpdateMeetingsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			console.log("DBMeeting.#get error:", error)
			return { status: false, data: [{ ...error }], message: error?.message || "Request failed!" }
		}
	}

	async #detail() {
		try {
			const roomId = await this.getCookie("roomId")

			if (!roomId) {
				throw { status: false, data: [], message: "Room id is empty!" }
			}

			const response = await fetch(`${this.#getDetailMeetingsApi.url}/${roomId}`, {
				method: this.#getMeetingsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			return await response.json()
		} catch (error) {
			console.log("DBMeeting.#get error:", error)
			return { status: false, data: [{ ...error }], message: error?.message || "Request failed!" }
		}
	}

	async #post(data) {
		try {
			const response = await fetch(this.#postMeetingsApi.url, {
				method: this.#postMeetingsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async #check({ roomId, password }) {
		try {
			const response = await fetch(this.#getCheckMeetingApi.url + `?roomid=${roomId}&password=${password}`, {
				method: this.#getCheckMeetingApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			const meeting = await response.json()
			return meeting
		} catch (error) {
			console.log("DBMeeting.#get error:", error)
			return { status: false, data: [{ ...error }] }
		}
	}

	async #register(data) {
		try {
			const response = await fetch(this.#postRegisterApi.url, {
				method: this.#postRegisterApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async #login(data) {
		try {
			const response = await fetch(this.#posLoginApi.url, {
				method: this.#posLoginApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async #postOtp(data) {
		try {
			const response = await fetch(this.#postOtpApi.url, {
				method: this.#postOtpApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async #resendOtp() {
		try {
			const response = await fetch(this.#getResendOtpApi.url, {
				method: this.#getResendOtpApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async detail() {
		return this.#detail()
	}

	async put(data) {
		return this.#put(data)
	}

	async get() {
		return await this.#get()
	}

	async getList(data) {
		return await this.#getList(data)
	}

	async post(data) {
		return await this.#post(data)
	}

	async postOtp(data) {
		return await this.#postOtp(data)
	}

	async getResenOtp() {
		return await this.#resendOtp()
	}

	async check(data) {
		return await this.#check(data)
	}

	async register(data) {
		return await this.#register(data)
	}

	async login(data) {
		return await this.#login(data)
	}

	async #postChat(data) {
		try {
			const response = await fetch(this.#postChatsApi.url, {
				method: this.#postChatsApi.method,
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...data }),
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async postChat(data) {
		return await this.#postChat(data)
	}

	async #postFile(data) {
		try {
			const response = await fetch(this.#postFilesApi.url, {
				method: this.#postFilesApi.method,
				credentials: "include",
				body: data,
			})

			return await response.json()
		} catch (error) {
			return {
				status: false,
				data: [{ name: error?.name || "ISE", message: error?.message || "Internal Server Error" }],
				message: error?.message || "Error DB Request!",
			}
		}
	}

	async postFile(data) {
		return await this.#postFile(data)
	}

	async getCookie(name) {
		const value = `; ${document.cookie}`
		const parts = value.split(`; ${name}=`)
		if (parts.length === 2) return parts.pop().split(";").shift()
	}
}

module.exports = { DBMeeting }

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
const { Helper } = require("../helper")
const { DBMeeting } = require("../helper/db")

const db = new DBMeeting()
db.init()

let language
if (!localStorage.getItem("language")) {
	language = localStorage.getItem("language")
	localStorage.setItem("language", "en")
} else {
	language = localStorage.getItem("language")
}

Helper.changeLanguage({ language })

document.querySelectorAll(".otp-input").forEach((input) => {
	input.addEventListener("input", (e) => {
		e.target.value = e.target.value.replace(/\D/g, "").slice(0, 1)

		if (e.target.value) {
			e.target.classList.add("filled")
		} else {
			e.target.classList.remove("filled")
		}
	})
})

const inputs = document.querySelectorAll(".otp-input")
class OTP {
	static async errorOtp({ message = "Invalid Code" }) {
		try {
			inputs.forEach((input, index) => {
				input.classList.remove("filled")
				input.classList.add("danger")
			})
			const success = document.getElementById("success-code")
			success.classList.add("d-none")
			success.inert = "Waiting OTP"

			const invalidOtp = document.getElementById("invalid-code")
			invalidOtp.classList.remove("d-none")
			invalidOtp.innerHTML = message
		} catch (error) {
			console.log("- Error OTP : ", error)
		}
	}

	static async successOtp({ message = "OTP Success" }) {
		try {
			inputs.forEach((input, index) => {
				input.classList.remove("danger")
				input.classList.add("filled")
			})
			const success = document.getElementById("success-code")
			success.classList.remove("d-none")
			success.innerHTML = message

			const invalidOtp = document.getElementById("invalid-code")
			invalidOtp.classList.add("d-none")
			invalidOtp.innerHTML = "Waiting OTP"
		} catch (error) {
			console.log("- Error OTP : ", error)
		}
	}

	static async resendOtp() {
		try {
			const response = await db.getResenOtp()
			if (!response.status) {
				await this.errorOtp({ message: response?.message || "Internal Server Error" })
			}

			const success = document.getElementById("success-code")
			success.classList.remove("d-none")
			success.innerHTML = response?.message || "OTP resent successfully"

			const invalidOtp = document.getElementById("invalid-code")
			invalidOtp.classList.add("d-none")
			invalidOtp.innerHTML = "Waiting OTP"

			setTimeout(() => {
				success.classList.add("d-none")
				success.innerHTML = ""
			}, 10 * 1000)

			return response.status
		} catch (error) {
			console.log("- Error OTP : ", error)
			return false
		}
	}
}

inputs.forEach((input, index) => {
	input.addEventListener("input", async (e) => {
		input.value = e.data ? e.data.slice(-1) : input.value.slice(-1)

		if (input.value && index < inputs.length - 1) {
			inputs[index + 1].focus()
		}

		if ([...inputs].every((i) => i.value.trim() !== "")) {
			const otp = [...inputs].map((i) => i.value).join("")
			const response = await db.postOtp({ otpCode: otp })
			console.log(response)

			if (!response.status) {
				await OTP.errorOtp({ message: response?.message || "Invalid Code" })
				throw { message: response?.message || "ISE" }
			}

			await OTP.successOtp({ message: response?.message || "OTP Success" })
		}
	})

	input.addEventListener("keydown", (e) => {
		if (e.key === "Backspace" && !input.value && index > 0) {
			inputs[index - 1].focus()
		}
	})
})

let countdownTime = 60
const countdownElement = document.getElementById("countdown")
const resendBtn = document.getElementById("resend-btn")

const startCountdown = () => {
	// Reset UI
	resendBtn.textContent = language == "en" ? "Resend" : "Kirim"
	resendBtn.style.cursor = "not-allowed"
	resendBtn.style.color = "#999"
	resendBtn.disabled = true // disable click

	let timer = setInterval(() => {
		let minutes = Math.floor(countdownTime / 60)
		let seconds = countdownTime % 60

		minutes = minutes < 10 ? "0" + minutes : minutes
		seconds = seconds < 10 ? "0" + seconds : seconds

		countdownElement.textContent = `${language == "en" ? "in" : "dalam"} ${minutes}:${seconds}`

		if (countdownTime <= 0) {
			clearInterval(timer)

			// Enable button again
			resendBtn.style.cursor = "pointer"
			resendBtn.style.color = "#2F6EFF"
			resendBtn.disabled = false
			resendBtn.textContent = language == "en" ? "Resend Now" : "Kirim Ulang"
			countdownElement.innerHTML = ""
		}

		countdownTime--
	}, 1000)
}

resendBtn.addEventListener("click", async () => {
	// prevent spam clicks
	if (resendBtn.disabled) return

	countdownTime = 60
	startCountdown()

	// Call resend OTP API
	const result = await OTP.resendOtp()
	if (!result) {
		console.log("Resend OTP failed")
	}

	window.location.href = baseUrl
})

startCountdown()

},{"../helper":2,"../helper/db":1}]},{},[3]);
