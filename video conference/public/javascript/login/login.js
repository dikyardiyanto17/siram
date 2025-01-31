const baseUrl = window.location.origin
const loginForm = {
	participant_id: "",
	full_name: "",
}

document.addEventListener("DOMContentLoaded", (e) => {
	document.getElementById("loading-id").className = "loading-hide"
})

const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)

const rid = params.get("rid")
const pw = params.get("pw")

const warning = ({ message }) => {
	try {
		document.getElementById("warning-container").style.top = "50px"
		document.getElementById("warning-message").innerHTML = message
		setTimeout(() => {
			document.getElementById("warning-container").style.top = "-100%"
			setTimeout(() => {
				document.getElementById("warning-message").innerHTML = ""
			}, 1000)
		}, 3000)
	} catch (error) {
		console.log("- Error Warning Message : ", error)
	}
}

const loginFormElement = document.getElementById("login-form-container")
loginFormElement.addEventListener("submit", async (event) => {
	try {
		event.preventDefault()
		loginForm.full_name = document.getElementById("full_name").value
		loginForm.participant_id = document.getElementById("participant_id").value

		if (!loginForm.full_name || loginForm.full_name.trim() == "") {
			throw { message: "Nama Lengkap Wajib Di isi" }
		}

		if (!loginForm.participant_id || loginForm.participant_id.trim() == "") {
			throw { message: "Id Peserta Wajib Di isi" }
		}

		localStorage.setItem("full_name", full_name)
		localStorage.setItem("participant_id", full_name)

		const response = await fetch(`${baseUrl}/custom_api/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginForm),
		})
		if (response.ok) {
			const { status, message, token } = await response.json()
			if (status) {
				const responseVideoConference = await fetch(`${baseUrl}/api/login`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(loginForm),
				})

				if (responseVideoConference.ok) {
					const data = await responseVideoConference.json()
					if (data.status) {
						if (rid && rid.trim() != "" && pw && pw.trim() != "") {
							window.location.href = `${baseUrl}/${rid && rid.trim() != "" && pw && pw.trim() != "" ? `?rid=${rid}&pw=${pw}` : ""}`
						} else {
							console.log(data)
							window.location.href = `${baseUrl}`
						}
					} else {
						throw { message: "Login failed" }
					}
				}
			} else {
				throw { message: "Peserta Tidak ditemukan" }
			}
		} else {
			throw { message: "Peserta Tidak ditemukan" }
		}
	} catch (error) {
		console.log("- Error Submmit Login : ", error)
		await warning({ message: error.message || "Login gagal, pastikan Nama dan ID yang dimasukkan valid" })
	}
})
