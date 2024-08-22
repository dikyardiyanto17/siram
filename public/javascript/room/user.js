class StaticEvent {
	static async methodAddUserList({ id, username, isAdmin }) {
		try {
			let userListElement = document.createElement("div")
			userListElement.className = "user-list-content"
			userListElement.id = `ul-${id}`
			userListElement.innerHTML = `
                                <div class="user-list-profile">
                                    <img src="/assets/icons/example_user.svg" alt="user-list-picture"
                                        class="user-list-picture" />
                                    <span class="user-list-username">${username}</span>
                                </div>
                                <div class="user-list-icons">
								${isAdmin ? '<span class="user-list-tag">Host</span>' : ""}
                                    
                                    <img id="mic-ul-${id}" src="/assets/icons/user_list_mic_active.svg" alt="user-list-icon"
                                        class="user-list-icon">
                                    <img src="/assets/icons/user_list_camera_active.svg" alt="user-list-icon"
                                        class="user-list-icon">
                                    <img src="/assets/icons/user_list_option.svg" alt="user-list-icon"
                                        class="user-list-icon">
                                </div>
                            `
			document.getElementById("users-list-container").appendChild(userListElement)
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	static updateTotalUserList({ total }) {
		try {
			document.getElementById("user-list-total").innerHTML = total
		} catch (error) {
			console.log("- Error Update Total User List : ", error)
		}
	}
}

class Users extends StaticEvent {
	#users
	#videoContainer
	#allUsers = []
	#currentLayout
	#currentVideoClass
	#previousVideoClass
	#userId
	#sinkId

	constructor() {
		super()
		this.#currentLayout = 0
		this.#users = 1
		this.#videoContainer = document.getElementById("video-container")
		this.#currentVideoClass = `video-user-container-1`
		this.#previousVideoClass = `video-user-container-1`
	}

	get userId() {
		return this.#userId
	}

	set userId(id) {
		this.#userId = id
	}

	async addMyVideo({ stream }) {
		try {
			let audioDevicesOutput = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audiooutput")
			audioDevicesOutput.forEach((audioDevices, index) => {
				if (index === 0) {
					this.#sinkId = audioDevices.deviceId
				}
			})
			await this.updateVideoCurrentClass()
			const checkUserElement = document.getElementById(`vc-${this.#userId}`)
			if (!checkUserElement) {
				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${this.#userId}`
				videoContainerElement.className = this.#currentVideoClass

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"
				userVideoElement.innerHTML = `<video id="v-${this.#userId}" muted autoplay class="user-video"></video>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainer.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${this.#userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = this.#userId
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				microphoneElement.innerHTML = `<img class="video-mic-image" src="/assets/icons/mic_level_3.svg" id="video-mic-${
					this.#userId
				}" alt="mic_icon"/>`
				userVideoElement.appendChild(microphoneElement)

				document.getElementById(`v-${this.#userId}`).srcObject = stream
			}
			await this.updateAllVideo()
			await this.updateVideoPreviousClass()
			await this.updateVideoContainer()
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async addVideo({ userId, track }) {
		try {
			await this.updateVideoCurrentClass()
			const checkUserElement = document.getElementById(`vc-${userId}`)
			if (!checkUserElement) {
				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = this.#currentVideoClass

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"

				userVideoElement.innerHTML = `<video id="v-${userId}" muted autoplay class="user-video"></video>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainer.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = userId
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				microphoneElement.innerHTML = `<img class="video-mic-image" src="/assets/icons/mic_level_3.svg" id="video-mic-${userId}" alt="mic_icon"/>`
				userVideoElement.appendChild(microphoneElement)

				await this.insertVideo({ track, id: userId })
			}
			await this.updateAllVideo()
			await this.updateVideoPreviousClass()
			await this.updateVideoContainer()
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async insertVideo({ track, id }) {
		try {
			if (track.kind !== "video") {
				throw new Error("Provided track is not a video track")
			}

			const videoElement = document.getElementById("v-" + id)

			if (videoElement) {
				videoElement.muted = true
				const mediaStream = new MediaStream([track])
				videoElement.srcObject = mediaStream

				videoElement.onerror = (event) => {
					console.log("Video playback error: ", event)
				}
			} else {
				throw new Error(`Video element with id v-${id} not found`)
			}
		} catch (error) {
			console.log("- Error Inserting Video: ", error)
		}
	}

	async createAudio({ id, track }) {
		try {
			let checkAudio = document.getElementById(`ac-${id}`)
			if (!checkAudio) {
				let audioContainer = document.getElementById("audio-collection")

				const newElem = document.createElement("div")
				newElem.id = `ac-${id}`
				newElem.innerHTML = `<audio id="a-${id}" autoplay></audio>`
				audioContainer.appendChild(newElem)

				const audioElement = document.getElementById(`a-${id}`)

				audioElement.srcObject = new MediaStream([track])

				audioElement.onmute = () => {
					console.log("Audio is muted")
				}

				audioElement.onunmute = () => {
					console.log("Audio is unmuted")
				}
				if (typeof audioElement.setSinkId !== "undefined") {
					audioElement
						.setSinkId(this.#sinkId)
						.then(() => {
							console.log(`Success, audio output device attached: ${this.#sinkId}`)
						})
						.catch((error) => {
							let errorMessage = error
							if (error.name === "SecurityError") {
								errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`
							}
							console.error(errorMessage)
						})
				} else {
					console.warn("Browser does not support output device selection.")
				}
			}
		} catch (error) {
			console.log("- Error Creating Audio: ", error)
		}
	}

	async deleteVideo({ userId }) {
		try {
			await this.updateVideoCurrentClass()
			const checkUserElement = document.getElementById(`vc-${userId}`)
			if (checkUserElement) {
				checkUserElement.remove()
				await this.updateAllVideo()
				await this.updateVideoPreviousClass()
				await this.updateVideoContainer()
			}
		} catch (error) {
			console.log("- Error Add Video : ", error)
		}
	}

	async updateAllVideo() {
		try {
			const videoElements = document.querySelectorAll(`.${this.#previousVideoClass}`)
			videoElements.forEach((element) => {
				element.classList.replace(`${this.#previousVideoClass}`, `${this.#currentVideoClass}`)
			})
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async updateVideoCurrentClass() {
		try {
			this.#currentVideoClass = `video-user-container-${this.#users}`
		} catch (error) {
			console.log("- Error Update Video Class : ", error)
		}
	}

	async updateVideoPreviousClass() {
		try {
			this.#previousVideoClass = `video-user-container-${this.#users}`
		} catch (error) {
			console.log("- Error Update Video Class : ", error)
		}
	}

	async addAllUser({ userId, admin, consumerId = null, kind = null, track = null, socketId }) {
		try {
			if (!this.#allUsers.some((u) => u.userId == userId)) {
				this.#allUsers.push({ userId, admin, socketId, consumer: [{ kind, id: consumerId, track }] })
				if (track) {
					await this.increaseUsers()
				}
				if (kind == "audio") {
					await this.createAudio({ id: userId, track })
				}
				if (kind == "video") {
					await this.addVideo({ userId, track })
				}
				await this.constructor.methodAddUserList({ id: userId, username: userId, isAdmin: admin })
				return
			}
			if (kind == "audio") {
				await this.createAudio({ id: userId, track })
			}
			if (kind == "video") {
				await this.addVideo({ userId, track })
			}
			const user = this.#allUsers.find((u) => u.userId == userId)
			user.consumer.push({ kind, id: consumerId, track })
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	get users() {
		return this.#users
	}

	set users(users) {
		this.#users = users
	}

	get allUsers() {
		return this.#allUsers
	}

	set allUsers(allUsers) {
		this.#allUsers = allUsers
	}

	async increaseUsers() {
		this.#users = this.#users + 1
		this.constructor.updateTotalUserList({ total: this.#users })
	}

	async decreaseUsers() {
		this.#users = this.#users - 1
		this.constructor.updateTotalUserList({ total: this.#users })
	}

	async updateVideoContainer() {
		try {
			this.#videoContainer = document.getElementById("video-container")
		} catch (error) {
			console.log("- Error Update Video Container : ", error)
		}
	}
}

module.exports = { Users }
