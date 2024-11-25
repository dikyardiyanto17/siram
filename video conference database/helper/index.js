const createdDate = { created_at: new Date(), updated_at: new Date(), last_updated_at: new Date() }

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

const formatDate = (dateStr) => {
	const date = new Date(dateStr)
	if (isNaN(date.getTime())) {
		return "Invalid Date" // Handle invalid date
	}
	const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
	const formattedDate = date.toLocaleDateString("id-ID", options)
	const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
	return `${formattedDate}, ${formattedTime}`
}

const formatedDate = (date) => {
	// const date = new Date(oldDate)
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

const formatedTime = (date) => {
	// const date = new Date(oldDate)
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	return `${hours}.${minutes}`
}

const saveSession = (session) => {
	return new Promise((resolve, reject) => {
		session.save((err) => {
			if (err) {
				return reject(err)
			}
			resolve()
		})
	})
}

module.exports = { createdDate, generateRandomId, formatDate, saveSession, formatedDate, formatedTime }
