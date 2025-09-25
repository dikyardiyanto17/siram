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
