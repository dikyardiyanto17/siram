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
