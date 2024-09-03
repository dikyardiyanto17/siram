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
                                    <img style="cursor: pointer;" id="ul-o-${id}" src="/assets/icons/user_list_option.svg" alt="user-list-icon"
                                        class="user-list-icon">
									<div class="user-list-icons-option d-none" id="ul-oc-${id}"><span id="ul-o-f-${id}">Pin</span></div>
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

	static warning({ message }) {
		try {
			document.getElementById("warning-container").style.top = "50px"
			document.getElementById("warning-message").innerHTML = message
			setTimeout(() => {
				document.getElementById("warning-container").style.top = "-100%"
				// if (!document.getElementById("warning-container").classList.contains("d-none")) {
				// 	document.getElementById("warning-container").classList.add("d-none")
				// }
				setTimeout(() => {
					document.getElementById("warning-message").innerHTML = ""
				}, 500)
			}, 3000)
		} catch (error) {
			console.log("- Error Warning Message : ", error)
		}
	}
}

class Users extends StaticEvent {
	#users
	#isAdmin
	#videoContainer
	#videoContainerFocus
	#allUsers = []
	#currentLayout = 1
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
	#upButton
	#downButton
	#totalDisplayedVideo
	#screenSharingMode = false
	#screenSharingPermission = false
	#screenSharingRequestPermission = false
	#userIdScreenSharing = ""

	// Layout Video
	#layoutVideoOptions
	#layoutCountContainer
	constructor() {
		super()
		// Layout Petak = 1, pembicara = 2, layout petaksamping = 3
		this.#currentLayout = 1
		this.#totalLayout = 6
		this.#totalDisplayedVideo = 0
		this.#users = 1
		this.#totalPage = 1
		this.#currentPage = 1
		this.#totalSidePage = 1
		this.#currentSidePage = 1
		this.#videoContainer = document.getElementById("video-collection")
		this.#videoContainerFocus = document.getElementById("video-container-focus")
		this.#currentVideoClass = `video-user-container-1`
		this.#previousVideoClass = `video-user-container-1`
		this.#previousButton = document.getElementById("previous-page")
		this.#nextButton = document.getElementById("next-page")
		this.#upButton = document.getElementById("arrow-up")
		this.#downButton = document.getElementById("arrow-down")

		// Layout Video
		this.#layoutVideoOptions = document.querySelectorAll(".layout-option-container")
		this.#layoutCountContainer = document.querySelectorAll(".layout-option")
		this.#screenSharingMode = false
		this.#screenSharingPermission = false
		this.#screenSharingRequestPermission = false
		this.#userIdScreenSharing = ""
	}

	get userId() {
		return this.#userId
	}

	set userId(id) {
		this.#userId = id
	}

	get isAdmin() {
		return this.#isAdmin
	}

	set isAdmin(adminStatus) {
		this.#isAdmin = adminStatus
	}

	get totalDisplayedVideo() {
		return this.#totalDisplayedVideo
	}

	get screenSharingPermission() {
		return this.#screenSharingPermission
	}

	set screenSharingPermission(permission) {
		this.#screenSharingPermission = permission
	}

	get screenSharingMode() {
		return this.#screenSharingMode
	}

	set screenSharingMode(condition) {
		this.#screenSharingMode = condition
	}

	get userIdScreenSharing() {
		return this.#userIdScreenSharing
	}

	set userIdScreenSharing(userId) {
		this.#userIdScreenSharing = userId
	}

	get screenSharingRequestPermission() {
		return this.#screenSharingRequestPermission
	}

	set screenSharingRequestPermission(permission) {
		this.#screenSharingRequestPermission = permission
	}

	async findAdmin() {
		try {
			const isAdmin = this.#allUsers.find((u) => u.admin)
			return isAdmin
		} catch (error) {
			console.log("- Error Check Permission Screen Sharing : ", error)
		}
	}

	async increaseTotalDisplayedVodeo() {
		this.#totalDisplayedVideo++
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

	async hideShowPreviousNextButton({ status }) {
		try {
			if (status) {
				this.#previousButton.classList.remove("d-none")
				this.#nextButton.classList.remove("d-none")
			} else {
				if (!this.#previousButton.classList.contains("d-none")) {
					this.#previousButton.classList.add("d-none")
				}

				if (!this.#nextButton.classList.contains("d-none")) {
					this.#nextButton.classList.add("d-none")
				}
			}
		} catch (error) {
			console.log("- Error Hide Previous Next Button : ", error)
		}
	}

	async hideShowUpDownButton({ status }) {
		try {
			if (status) {
				this.#upButton.classList.remove("d-none")
				this.#downButton.classList.remove("d-none")
			} else {
				if (!this.#downButton.classList.contains("d-none")) {
					this.#downButton.classList.add("d-none")
				}

				if (!this.#upButton.classList.contains("d-none")) {
					this.#upButton.classList.add("d-none")
				}
			}
		} catch (error) {
			console.log("- Error Hide Up Down Button : ", error)
		}
	}

	async changeMaxPage() {
		try {
			document.getElementById("previous-number-total").innerHTML = this.#totalPage
			document.getElementById("next-number-total").innerHTML = this.#totalPage
			document.getElementById("up-number-total").innerHTML = this.#totalPage
			document.getElementById("down-number-total").innerHTML = this.#totalPage
			await this.changeCurrentPage()
		} catch (error) {
			console.log("- Error Change Max Page : ", error)
		}
	}

	async changeCurrentPage() {
		try {
			document.getElementById("previous-number").innerHTML = this.#currentPage == 1 ? 1 : this.#currentPage - 1
			document.getElementById("next-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage + 1
			document.getElementById("down-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage + 1
			document.getElementById("up-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage - 1
		} catch (error) {
			console.log("- Error Change Max Page : ", error)
		}
	}

	async updatePageInformation() {
		try {
			if (this.#currentLayout == 1) {
				this.#totalPage = Math.ceil(this.#users / this.#totalLayout)
				await this.changeMaxPage()
			} else if (this.#currentLayout == 2) {
				console.log("- Do Nothing")
			} else if (this.#currentLayout == 3) {
				this.#totalLayout = 5
				this.#totalPage = Math.ceil(this.#users / this.#totalLayout)
				await this.changeMaxPage()
			}
		} catch (error) {
			console.log("- Error Check Page : ", error)
		}
	}

	async checkLayout({ index = null }) {
		try {
			if (index) {
				if (index >= this.#totalLayout) {
					return false
				} else {
					return true
				}
			}
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

	async addVideo({ userId, track, index = null }) {
		try {
			let check = await this.checkLayout({ index })
			if (!check || this.#currentLayout == 2) {
				return
			}
			if (!this.#videoContainerFocus.classList.contains("d-none") && this.#currentLayout == 1) {
				this.#videoContainerFocus.classList.add("d-none")
			}
			const checkUserElement = document.getElementById(`vc-${userId}`)
			if (!checkUserElement) {
				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = this.#currentLayout == 1 ? this.#currentVideoClass : "video-user-container-focus-user"

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
				await this.increaseTotalDisplayedVodeo()
			}
			await this.updateVideoCurrentClass()
			if (this.#currentLayout == 1) {
				await this.updateAllVideo()
			}
			await this.updateVideoPreviousClass()
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async addFocusVideo({ userId, track }) {
		try {
			const checkUserElement = document.getElementById(`vc-${userId}`)
			this.#videoContainerFocus.classList.remove("d-none")
			if (!checkUserElement) {
				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = `video-user-container-1`

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"

				userVideoElement.innerHTML = `<video id="v-${userId}" muted autoplay class="user-video"></video>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainerFocus.appendChild(videoContainerElement)

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

	async selectVideoLayout({ container, socket }) {
		try {
			if (container.dataset.option == 1 && this.#screenSharingMode) {
				this.constructor.warning({ message: "Cannot change to the selected layout" })
				return
			}
			document.querySelectorAll(".layout-option-container").forEach((c) => {
				const radio = c.querySelector(".radio")
				if (c === container) {
					radio.src = "/assets/icons/radio_button_active.svg"
					this.#currentLayout = c.dataset.option
				} else {
					radio.src = "/assets/icons/radio_button.svg"
				}
			})
			await this.statusLayoutCount()
			await this.updateVideo({ socket })
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async statusLayoutCount() {
		try {
			if (this.#currentLayout == "1") {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.remove("custom-disable")
						container.removeAttribute("pointer-events")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				document.getElementById("alert-video-layout").classList.add("hide-alert")
			} else {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.add("custom-disable")
						container.setAttribute("pointer-events", "none")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				document.getElementById("alert-video-layout").classList.remove("hide-alert")
			}
		} catch (error) {
			console.log("- Error Status Layout Count : ", error)
		}
	}

	async addAllUser({ userId, admin, consumerId = null, kind = null, track = null, socketId, focus = false, socket, index = null, appData = null }) {
		try {
			if (!this.#allUsers.some((u) => u.userId == userId)) {
				this.#allUsers.push({ userId, admin, socketId, consumer: [{ kind, id: consumerId, track, appData, focus }] })
				if (consumerId != null) {
					await this.increaseUsers()
				}
				if (kind == "audio" && consumerId != null && appData.label == "audio") {
					await this.createAudio({ id: userId, track })
				}
				if (kind == "video" && appData.label == "video") {
					await this.addVideo({ userId, track, displayedVideo, index })
				}
				if (appData && appData.label == "screensharing_audio") {
					await this.createAudio({ id: "ssa_" + userId, track })
				}

				if (appData && appData.label == "screensharing_video") {
					await this.increaseUsers()
					await this.addVideo({ userId: "ssv_" + userId, track, index })
				}
				await this.constructor.methodAddUserList({ id: userId, username: userId, isAdmin: admin })
				await this.updatePageInformation()
				const optionUserList = document.getElementById(`ul-o-${userId}`)
				optionUserList.addEventListener("click", (e) => {
					e.stopPropagation()
					const optionUserListContainerLatest = document.getElementById(`ul-oc-${userId}`)
					if (optionUserListContainerLatest.classList.contains("d-none")) {
						optionUserListContainerLatest.classList.remove("d-none")
					} else {
						optionUserListContainerLatest.classList.add("d-none")
					}
				})
				const optionUserListContainer = document.getElementById(`ul-oc-${userId}`)
				optionUserListContainer.addEventListener("click", async () => {
					try {
						this.#allUsers.forEach((u) => {
							if (u.userId == userId) {
								u.consumer.forEach((c) => {
									c.focus = true
								})
							} else {
								u.consumer.forEach((c) => {
									c.focus = false
								})
							}
						})
						await this.updateVideo({ socket })
					} catch (error) {
						console.log("- Error Option User List Container : ", error)
					}
				})
				return
			}
			const user = this.#allUsers.find((u) => u.userId == userId)
			user.consumer.push({ kind, id: consumerId, track, appData, focus })
			if (kind == "audio" && consumerId != null && appData.label == "audio") {
				await this.createAudio({ id: userId, track })
			}
			if (kind == "video" && appData.label == "video") {
				await this.addVideo({ userId, track, index })
			}

			if (appData && appData.label == "screensharing_audio") {
				await this.createAudio({ id: "ssa_" + userId, track })
			}

			if (appData && appData.label == "screensharing_video") {
				await this.increaseUsers()
				await this.addVideo({ userId: "ssv_" + userId, track, index })
			}
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	async deleteAllUser({ userId }) {
		try {
			let isScreenSharing = false
			let changeFocus = false

			this.#allUsers.forEach((u) => {
				u.consumer.forEach((c) => {
					if (c.focus && u.userId == userId) {
						changeFocus = true
					}

					if (c.focus && u.userId == userId && c.appData.label == "screensharing_video") {
						isScreenSharing = true
					}
				})
			})

			this.#allUsers = this.#allUsers.filter((u) => u.userId != userId)

			if (changeFocus && this.#allUsers.length > 0) {
				this.#allUsers[0].consumer.forEach((c) => {
					if (c.kind == "video") {
						c.focus = true
					}
				})
			}
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
			document.getElementById("video-container-focus").innerHTML = ""
		} catch (error) {
			console.log("- Error Update Video Container : ", error)
		}
	}

	async selectLayoutCount({ container, socket }) {
		try {
			if (this.#currentLayout != 1) {
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

	async updateVideoContainerLayout() {
		try {
			if (this.#currentLayout == 3) {
				this.#videoContainer.classList.remove("d-none")
				this.#videoContainer.style.width = "20%"
				this.#videoContainer.style.alignContent = "center"
				this.#videoContainerFocus.style.width = "80%"
				this.#videoContainerFocus.classList.remove("d-none")
			} else if (this.#currentLayout == 1) {
				this.#videoContainer.removeAttribute("style")
				this.#videoContainer.classList.remove("d-none")
				this.#videoContainerFocus.removeAttribute("style")
				if (!this.#videoContainerFocus.classList.contains("d-none")) {
					this.#videoContainerFocus.classList.add("d-none")
				}
			} else if (this.#currentLayout == 2) {
				if (!this.#videoContainer.classList.contains("d-none")) {
					this.#videoContainer.classList.add("d-none")
				}
				this.#videoContainerFocus.classList.remove("d-none")
				this.#videoContainerFocus.removeAttribute("style")
				this.#videoContainer.removeAttribute("style")
			}
		} catch (error) {
			console.log("- Error Update Video Container Layout : ", error)
		}
	}

	async updateVideo({ socket }) {
		try {
			let customIndex = 0
			await this.emptyVideoContainer()
			await this.updateVideoContainerLayout()
			if (this.#currentLayout == 1) {
				if (this.#totalLayout == 5) {
					this.#totalLayout = 6
				}
				if (this.#videoContainer.classList.contains("d-none")) {
					this.#videoContainer.classList.remove("d-none")
				}
				await this.hideShowPreviousNextButton({ status: true })
				await this.hideShowUpDownButton({ status: false })
				await this.updatePageInformation()
				await this.updateVideoContainer()
				this.#totalDisplayedVideo = 0

				const promises = this.#allUsers.map(async (u, index) => {
					const min = this.#currentPage * this.#totalLayout - (this.#totalLayout - 1)
					const max = this.#currentPage * this.#totalLayout
					let tracks = u.consumer.filter((t) => t.kind == "video")

					// let track = u.consumer.find((t) => t.kind == "video")
					for (const track of tracks) {
						if (customIndex + 1 >= min && customIndex + 1 <= max) {
							await this.addVideo({ userId: u.userId, track: track.track })
							if (track.id != null) {
								socket.emit("consumer-resume", { serverConsumerId: track.id })
							}
						} else {
							if (track.id != null) {
								socket.emit("consumer-pause", { serverConsumerId: track.id })
							}
						}
						customIndex++
					}
				})

				await Promise.all(promises)

				if (this.#totalDisplayedVideo == 0) {
					await this.previousVideo({ socket })
				}
			} else if (this.#currentLayout == 2) {
				this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: false })
				this.#allUsers.forEach(async (u) => {
					let tracks = u.consumer.filter((t) => t.kind == "video")

					for (const track of tracks) {
						if (track.focus) {
							await this.addFocusVideo({ userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId, track: track.track })
							if (track.id != null) {
								socket.emit("consumer-resume", { serverConsumerId: track.id })
							}
						} else {
							socket.emit("consumer-pause", { serverConsumerId: track.id })
						}
					}
				})
			} else if (this.#currentLayout == 3) {
				await this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: true })
				this.#totalDisplayedVideo = 0
				await this.updatePageInformation()
				await this.updateVideoContainer()

				this.#allUsers.forEach(async (u) => {
					const min = this.#currentPage * this.#totalLayout - (this.#totalLayout - 1)
					const max = this.#currentPage * this.#totalLayout
					let tracks = u.consumer.filter((t) => t.kind == "video")
					for (const track of tracks) {
						if (track.focus) {
							await this.addFocusVideo({ track: track.track, userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId })
							socket.emit("consumer-resume", { serverConsumerId: track.id })
						} else if (customIndex + 1 >= min && customIndex + 1 <= max) {
							customIndex++
							await this.addVideo({ userId: u.userId, track: track.track })
							if (track.id != null) {
								socket.emit("consumer-resume", { serverConsumerId: track.id })
							}
						} else {
							customIndex++
							socket.emit("consumer-pause", { serverConsumerId: track.id })
						}
					}
				})
			}
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async addForceCloseList({ socket, userId }) {
		try {
			let userListElement = document.createElement("div")
			const userListContainerElement = document.getElementById("users-list-container")
			userListElement.className = "user-list-content"
			userListElement.id = `ul-ss-${userId}`
			userListElement.innerHTML = `
                                <div class="user-list-profile">
                                    <img src="/assets/icons/example_user.svg" alt="user-list-picture"
                                        class="user-list-picture" />
                                    <span class="user-list-username">${userId}</span>
                                </div>
                                <div class="user-list-icons">
									<span class="user-list-tag">Layar</span>
									${this.#isAdmin ? `<span id="stop-ss-${userId}" class="user-list-tag-ss">Stop</span>` : ""}
                                </div>
                            `
			await userListContainerElement.insertBefore(userListElement, userListContainerElement.firstChild)
			if (this.#isAdmin && userId != this.#userId) {
				document.getElementById(`ul-ss-${userId}`).addEventListener("click", () => {
					try {
						const user = this.#allUsers.find((u) => u.userId == userId)
						socket.emit("force-stop-screensharing", { to: user.socketId })
					} catch (error) {
						console.log("- Error Stopping Screen Sharing : ", error)
					}
				})
			}
		} catch (error) {
			console.log("- Error Add Force Close List : ", error)
		}
	}

	async changeScreenSharingMode({ status, userId, socket }) {
		try {
			if (status) {
				// I forgot what i wanted to do :)
				await this.addForceCloseList({ socket, userId })
				this.#userIdScreenSharing = userId
				this.#screenSharingMode = true
				this.#currentLayout = 3
				this.#allUsers.forEach((u) => {
					if (u.userId == userId) {
						u.consumer.forEach((c) => {
							if (c.appData.label == "screensharing_video") {
								c.focus = true
							} else {
								c.focus = false
							}
						})
					} else {
						u.consumer.forEach((c) => {
							c.focus = false
						})
					}
				})
				await document.getElementById("layout-3").click()
			} else {
				this.#userIdScreenSharing = ""
				this.#screenSharingMode = false
				await this.updateVideo({ socket })
				if (!this.#isAdmin && this.#screenSharingPermission) {
					this.#screenSharingPermission = false
				}
				if (document.getElementById(`ul-ss-${userId}`)) {
					document.getElementById(`ul-ss-${userId}`).remove()
				}
			}
		} catch (error) {
			console.log("- Error Change Screen Sharing Mode : ", error)
		}
	}

	async closeConsumer({ label, userId, consumerId = null, socket }) {
		try {
			const user = this.#allUsers.find((u) => u.userId == userId)
			if (user) {
				if (label == "screensharing_video" || label == "screensharing_audio") {
					if (label == "screensharing_video") {
						user.consumer = user.consumer.filter((c) => c.appData.label != "screensharing_video")
						await this.decreaseUsers()
						user.consumer.forEach((c) => {
							if (c.kind == "video" && c.appData.label == "video") {
								c.focus = true
							}
						})
						this.changeScreenSharingMode({ status: false, userId, socket })
					}
					if (label == "screensharing_audio") {
						user.consumer = user.consumer.filter((c) => c.appData.label != "screensharing_audio")
						user.consumer.forEach((c) => {
							if (c.kind == "video" && c.appData.label == "video") {
								c.focus = true
							}
						})
					}
				} else {
					user.consumer = user.consumer.filter((c) => c.id != consumerId)
				}
			}
		} catch (error) {
			console.log("- Error Close Consumer : ", error)
		}
	}

	async screenSharingPermissionForAdmin({ socket, userId, socketId }) {
		try {
			const permissionContainer = document.getElementById("screensharing-permissions")

			const newPermission = document.createElement("div")
			newPermission.className = "screensharing-permission"
			newPermission.id = `screensharing-permission-${userId}`

			const permissionTitle = document.createElement("div")
			permissionTitle.className = "permission-title"
			permissionTitle.innerHTML = `${userId} ingin berbagi layar`

			const permissionButton = document.createElement("div")
			permissionButton.className = "permission-button"

			const permitButton = document.createElement("button")
			permitButton.className = "accept-ss"
			permitButton.innerHTML = "Izinkan"

			const rejectButton = document.createElement("button")
			rejectButton.className = "reject-ss"
			rejectButton.innerHTML = "Tolak"

			permissionContainer.appendChild(newPermission)

			newPermission.appendChild(permissionTitle)
			newPermission.appendChild(permissionButton)

			permissionButton.appendChild(rejectButton)
			permissionButton.appendChild(permitButton)

			const responseReject = async ({ socket }) => {
				try {
					socket.emit("screensharing-permission", { socketId: socket.id, userId: this.#userId, to: socketId, type: "response", response: false })
				} catch (error) {
					console.log("- Error Socket Emit Screen Sharing Permission : ", error)
				}
			}

			const responseAccept = async ({ socket }) => {
				try {
					socket.emit("screensharing-permission", { socketId: socket.id, userId: this.#userId, to: socketId, type: "response", response: true })
				} catch (error) {
					console.log("- Error Socket Emit Screen Sharing Permission : ", error)
				}
			}

			rejectButton.addEventListener("click", async () => {
				try {
					await responseReject({ socket })
					await newPermission.remove()
				} catch (error) {
					console.log("- Error Accept Permission Screen Sharing : ", error)
				}
			})

			permitButton.addEventListener("click", async () => {
				try {
					await responseAccept({ socket })
					await newPermission.remove()
				} catch (error) {
					console.log("- Error Accept Permission Screen Sharing : ", error)
				}
			})
		} catch (error) {
			console.log("- Error Screen Sharing Permission : ", error)
		}
	}

	async screenSharingPermissionForUser({ socket }) {
		try {
			const admin = await this.findAdmin()
			socket.emit("screensharing-permission", { socketId: socket.id, userId: this.#userId, to: admin.socketId, type: "request", response: false })
			const permissionContainer = document.getElementById("screensharing-permissions")

			const newPermission = document.createElement("div")
			newPermission.className = "screensharing-permission"
			newPermission.innerHTML = "Meminta izin untuk berbagi layar ke admin"
			newPermission.id = `screensharing-permission-${this.#userId}`

			permissionContainer.appendChild(newPermission)
			this.#screenSharingRequestPermission = true
		} catch (error) {
			console.log("- Error Screen Sharing Permission : ", error)
		}
	}
}

module.exports = { Users }
