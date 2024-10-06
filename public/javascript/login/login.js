const loginForm = {
	participant_id: "",
	full_name: "",
}

const urlParam = new URL(window.location.href)
const params = new URLSearchParams(urlParam.search)

const rid = params.get("rid")
const pw = params.get("pw")

const baseUrl = window.location.origin

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

const submitButton = document.getElementById("submit-button")

submitButton.addEventListener("click", async () => {
	try {
		loginForm.full_name = document.getElementById("full_name").value
		loginForm.participant_id = document.getElementById("participant_id").value
		console.log(baseUrl)

		if (!loginForm.full_name || loginForm.full_name.trim() == "") {
			throw { message: "Nama Lengkap Wajib Di isi" }
		}

		if (!loginForm.participant_id || loginForm.participant_id.trim() == "") {
			throw { message: "Id Peserta Wajib Di isi" }
		}

		const response = await fetch(`${baseUrl}/api/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginForm),
		})

		if (!response.status) {
			throw { message: "Peserta Tidak ditemukan" }
		}

		if (response.status) {
			const { status, authority } = await response.json()
			if (status) {
				if (rid && rid.trim() != "" && pw && pw.trim() != "") {
					window.location.href = `${baseUrl}/${rid && rid.trim() != "" && pw && pw.trim() != "" ? `?rid=${rid}&pw=${pw}` : ""}`
				} else if (authority == 1 || authority == 2) {
					window.location.href = `${baseUrl}/dashboard`
				} else if (authority == 3) {
					window.location.href = `${baseUrl}/${rid && rid.trim() != "" && pw && pw.trim() != "" ? `?rid=${rid}&pw=${pw}` : ""}`
				}
			}
		}
	} catch (error) {
		console.log("- Error Submit Button : ", error)
		await warning({ message: error.message })
	}
})
