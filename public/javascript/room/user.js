class StaticEvent {
	static methodAddUserList({ id, username, isAdmin }) {
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
	#currentLayout = 0
	#totalLayout = 6
	#totalPage = 1
	#currentPage = 1
	#totalSidePage = 1
	#currentSidePage = 1
	#currentVideoClass
	#previousVideoClass
	#userId
	#sinkId
	#previousButton
	#nextButton
	#totalDisplayedVideo

	// Layout Video
	#layoutVideoOptions
	#layoutCountContainer
	constructor() {
		super()
		// Layout Petak = 0, pembicara = 1, layout petaksamping = 2
		this.#currentLayout = 0
		this.#totalLayout = 6
		this.#totalDisplayedVideo = 0
		this.#users = 1
		this.#totalPage = 1
		this.#currentPage = 1
		this.#totalSidePage = 1
		this.#currentSidePage = 1
		this.#videoContainer = document.getElementById("video-collection")
		this.#currentVideoClass = `video-user-container-1`
		this.#previousVideoClass = `video-user-container-1`
		this.#previousButton = document.getElementById("previous-page")
		this.#nextButton = document.getElementById("next-page")

		// Layout Video
		this.#layoutVideoOptions = document.querySelectorAll(".layout-option-container")
		this.#layoutCountContainer = document.querySelectorAll(".layout-option")
	}

	get userId() {
		return this.#userId
	}

	set userId(id) {
		this.#userId = id
	}

	get totalDisplayedVideo() {
		return this.#totalDisplayedVideo
	}

	async checkVideo({ userId }) {
		try {
			if (document.getElementById(`v-${userId}`)) {
				return true
			} else {
				return false
			}
		} catch (error) {
			console.log("- Error Check Video : ", error)
		}
	}

	async hidePreviousNextButton() {
		try {
			if (!this.#previousButton.classList.contains("d-none")) {
				this.#previousButton.classList.add("d-none")
			}

			if (!this.#nextButton.classList.contains("d-none")) {
				this.#nextButton.classList.add("d-none")
			}
		} catch (error) {
			console.log("- Error Hide Previous Next Button : ", error)
		}
	}

	async changeMaxPage() {
		try {
			document.getElementById("previous-number-total").innerHTML = this.#totalPage
			document.getElementById("next-number-total").innerHTML = this.#totalPage
			await this.changeCurrentPage()
		} catch (error) {
			console.log("- Error Change Max Page : ", error)
		}
	}

	async changeCurrentPage() {
		try {
			document.getElementById("previous-number").innerHTML = this.#currentPage == 1 ? 1 : this.#currentPage - 1
			document.getElementById("next-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage + 1
		} catch (error) {
			console.log("- Error Change Max Page : ", error)
		}
	}

	async updatePageInformation() {
		try {
			if (this.#currentLayout == 0) {
				this.#totalPage = Math.ceil(this.#users / this.#totalLayout)
				await this.changeMaxPage()
			} else if (this.#currentLayout == 1) {
				console.log("- Do Nothing")
			} else if (this.#currentLayout == 2) {
				console.log("- Do Nothing")
			}
		} catch (error) {
			console.log("- Error Check Page : ", error)
		}
	}

	async checkLayout() {
		try {
			if (this.#totalDisplayedVideo >= this.#totalLayout) {
				return false
			} else {
				return true
			}
		} catch (error) {
			console.log("- Error Check Layout : ", error)
		}
	}

	async audioDevicesOutput({ stream }) {
		try {
			let audioDevicesOutput = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audiooutput")
			audioDevicesOutput.forEach((audioDevices, index) => {
				if (index === 0) {
					this.#sinkId = audioDevices.deviceId
				}
			})
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async addVideo({ userId, track }) {
		try {
			let check = await this.checkLayout()
			if (!check) {
				return
			}
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
				this.#totalDisplayedVideo = this.#totalDisplayedVideo + 1
			}
			await this.updateVideoCurrentClass()
			await this.updateAllVideo()
			await this.updateVideoPreviousClass()
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
			const checkUserElement = document.getElementById(`vc-${userId}`)

			if (checkUserElement) {
				const tracks = await document.getElementById(`v-${userId}`).srcObject.getTracks()

				tracks.forEach((track) => {
					track.stop()
				})
				checkUserElement.remove()
				await this.updateVideoCurrentClass()
				await this.updateAllVideo()
				await this.updateVideoPreviousClass()
			}
		} catch (error) {
			console.log("- Error Add Video : ", error)
		}
	}

	async deleteAudio({ userId }) {
		try {
			const checkUserElement = document.getElementById(`a-${userId}`)
			if (checkUserElement) {
				const tracks = await checkUserElement.srcObject.getTracks()
				tracks.forEach((track) => {
					console.log(track)
					track.stop()
				})
				checkUserElement.remove()
			}
		} catch (error) {
			console.log("- Error Delete Audio : ", error)
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
			if (this.#users < this.#totalLayout) {
				this.#currentVideoClass = `video-user-container-${this.#users}`
			} else {
				this.#currentVideoClass = `video-user-container-${this.#totalLayout}`
			}
		} catch (error) {
			console.log("- Error Update Video Class : ", error)
		}
	}

	async updateVideoPreviousClass() {
		try {
			if (this.#users < this.#totalLayout) {
				this.#previousVideoClass = `video-user-container-${this.#users}`
			} else {
				this.#previousVideoClass = `video-user-container-${this.#totalLayout}`
			}
		} catch (error) {
			console.log("- Error Update Video Class : ", error)
		}
	}

	async addAllUser({ userId, admin, consumerId = null, kind = null, track = null, socketId }) {
		try {
			if (!this.#allUsers.some((u) => u.userId == userId)) {
				this.#allUsers.push({ userId, admin, socketId, consumer: [{ kind, id: consumerId, track }] })
				if (consumerId != null) {
					await this.increaseUsers()
				}
				if (kind == "audio" && consumerId != null) {
					await this.createAudio({ id: userId, track })
				}
				if (kind == "video") {
					await this.addVideo({ userId, track })
				}
				await this.constructor.methodAddUserList({ id: userId, username: userId, isAdmin: admin })
				await this.updatePageInformation()
				return
			}
			if (kind == "audio" && consumerId != null) {
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

	async deleteAllUser({ userId }) {
		try {
			this.#allUsers = this.#allUsers.filter((u) => u.userId != userId)
		} catch (error) {
			console.log("- Error Delete All User : ", error)
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
			this.#videoContainer = document.getElementById("video-collection")
		} catch (error) {
			console.log("- Error Update Video Container : ", error)
		}
	}

	async emptyVideoContainer() {
		try {
			document.getElementById("video-collection").innerHTML = ""
		} catch (error) {
			console.log("- Error Update Video Container : ", error)
		}
	}

	async selectLayoutCount({ container, socket }) {
		try {
			if (this.#currentLayout != 0) {
				return
			}
			this.#layoutCountContainer.forEach((c) => {
				const radio = c.querySelector(".mini-radio")
				if (c === container) {
					radio.src = "/assets/icons/mini_radio_active.svg"
					this.#totalLayout = c.dataset.option
				} else {
					radio.src = "/assets/icons/mini_radio.svg"
				}
			})

			this.#currentPage = 1
			await this.updateVideo({ socket })
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async previousVideo({ socket }) {
		try {
			await this.updatePageInformation()
			if (this.#currentPage == 1) {
				return
			}
			this.#currentPage = this.#currentPage - 1
			await this.updateVideo({ socket })
		} catch (error) {
			console.log("- Error Previous Video : ", error)
		}
	}

	async nextVideo({ socket }) {
		try {
			await this.updatePageInformation()
			if (this.#currentPage == this.#totalPage) {
				return
			}
			this.#currentPage = this.#currentPage + 1
			await this.updateVideo({ socket })
		} catch (error) {
			console.log("- Error Next Video : ", error)
		}
	}

	async updateVideo({ socket }) {
		try {
			await this.updatePageInformation()
			await this.emptyVideoContainer()
			await this.updateVideoContainer()
			this.#totalDisplayedVideo = 0

			const promises = this.#allUsers.map(async (u, index) => {
				const min = this.#currentPage * this.#totalLayout - (this.#totalLayout - 1)
				const max = this.#currentPage * this.#totalLayout
				let track = u.consumer.find((t) => t.kind == "video")

				if (index + 1 >= min && index + 1 <= max) {
					await this.addVideo({ userId: u.userId, track: track.track })
					if (track.id != null) {
						socket.emit("consumer-resume", { serverConsumerId: track.id })
					}
				} else {
					if (track.id != null) {
						socket.emit("consumer-pause", { serverConsumerId: track.id })
					}
				}
			})

			await Promise.all(promises)

			if (this.#totalDisplayedVideo == 0) {
				await this.previousVideo({ socket })
			}
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}
}

module.exports = { Users }
