const createdDate = { createdAt: new Date(), updatedAt: new Date(), last_updated_at: new Date() }

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
	console.log(date)
	if (isNaN(date.getTime())) {
		return "Invalid Date" // Handle invalid date
	}
	const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
	const formattedDate = date.toLocaleDateString("id-ID", options)
	const formattedTime = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
	return `${formattedDate}, ${formattedTime}`
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

module.exports = { createdDate, generateRandomId, formatDate, saveSession }
