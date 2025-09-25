class StaticEvent {
	static messageListEvent() {
		try {
			const messageToList = document.getElementById("message-to-list")
			if (messageToList.classList.contains("d-none")) {
				messageToList.classList.remove("d-none")
			} else {
				messageToList.classList.add("d-none")
			}
		} catch (error) {
			console.log("- Error Message List Event", error)
		}
	}
	static getInitialsAndColor(name) {
		// Extract initials and limit to 2 characters
		const initials = name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join("")
			.slice(0, 2) // Ensure only 2 characters

		const randomColor = `#${Math.floor(Math.random() * 16777215)
			.toString(16)
			.padStart(6, "0")}`

		return { initials, color: randomColor }
	}
	static generateRandomId(length = 12, separator = "-", separatorInterval = 4) {
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

	static selectChat({ id, username }) {
		try {
			const chatContainerElement = document.getElementById(`chat-${id}`)
			const allChatContents = document.querySelectorAll(".chat-content")
			const allListChatTo = document.querySelectorAll(".list-chat-to")
			const selectedListChatTo = document.getElementById(`chat-to-${id}`)

			this.messageListEvent()

			allChatContents.forEach((el) => {
				if (el != chatContainerElement) {
					el.classList.add("d-none")
				} else {
					el.classList.remove("d-none")
				}
			})

			allListChatTo.forEach((el) => {
				if (el !== selectedListChatTo) {
					el.classList.remove("selected")
				} else {
					el.classList.add("selected")
				}
			})

			selectedListChatTo.classList.add("selected")
			chatContainerElement.classList.remove("d-none")
			document.getElementById("chat-selected-to").innerHTML = username
		} catch (error) {
			console.log("- Error Select Chat : ", error)
		}
	}

	static resetChat() {
		try {
			const chatContainerElement = document.getElementById(`chat-everyone`)
			const allChatContents = document.querySelectorAll(".chat-content")
			const allListChatTo = document.querySelectorAll(".list-chat-to")
			const selectedListChatTo = document.getElementById(`chat-to-everyone`)

			allChatContents.forEach((el) => {
				if (el !== chatContainerElement) {
					el.classList.add("d-none")
				} else {
					el.classList.remove("d-none")
				}
			})

			allListChatTo.forEach((el) => {
				if (el !== selectedListChatTo) {
					el.classList.remove("selected")
				} else {
					el.classList.add("selected")
				}
			})

			document.getElementById("chat-selected-to").innerHTML = "Everyone"
		} catch (error) {
			console.log("- Error Select Chat : ", error)
		}
	}

	static createChat({ id, username, createChatTo = true, createChatContainer = true }) {
		try {
			const isChatToElementExist = document.getElementById(`chat-to-${id}`)
			const isChatContainerElementExist = document.getElementById(`chat-${id}`)
			if (!isChatToElementExist && createChatTo) {
				const chatToElement = document.createElement("div")
				chatToElement.classList.add(`chat-to-${id}`)
				chatToElement.id = `chat-to-${id}`
				chatToElement.classList.add(`list-chat-to`)
				chatToElement.dataset.userId = id
				chatToElement.innerHTML = `<span>${username}</span>`
				document.getElementById("message-to-list").appendChild(chatToElement)
				chatToElement.addEventListener("click", (e) => this.selectChat({ id, username }))
			}

			if (!isChatContainerElementExist && createChatContainer) {
				const chatContainerElement = document.createElement("div")
				chatContainerElement.classList.add("chat-content")
				chatContainerElement.classList.add("d-none")
				chatContainerElement.id = `chat-${id}`
				chatContainerElement.dataset.username = username
				document.getElementById("chat-everyone").insertAdjacentElement("afterend", chatContainerElement)
			}
		} catch (error) {
			console.log("- Error Create Chat : ", error)
		}
	}

	static methodAddUserList({ id, username, authority, picture, userId, userAuthority }) {
		try {
			const alphabetUsername = this.getInitialsAndColor(username)
			let userListElement = document.createElement("div")
			let authorityElement = ``
			if (authority == 1) {
				authorityElement = '<span class="user-list-tag">Host</span>'
			} else if (authority == 2) {
				authorityElement = '<span class="user-list-tag">Co-Host</span>'
			}
			const kickTitle = localStorage.getItem("language")
			userListElement.className = "user-list-content"
			userListElement.id = `ul-${id}`
			userListElement.innerHTML = `
                                <div class="user-list-profile">
									<span id="color-${id}" style="color: ${alphabetUsername.color};" class="user-list-picture">${alphabetUsername.initials}</span>
                                    <span class="user-list-username">${username}</span>
                                </div>
                                <div class="user-list-icons">
									${authorityElement}
                                    <img id="mic-ul-${id}" src="${baseUrl}/assets/icons/user_list_mic_active.svg" alt="user-list-icon"
                                        class="user-list-icon">
                                    <img id="camera-ul-${id}" src="${baseUrl}/assets/icons/user_list_camera.svg" alt="user-list-icon"
                                        class="user-list-icon">
                                    <img style="cursor: pointer;" id="ul-o-${id}" src="${baseUrl}/assets/icons/user_list_option.svg" alt="user-list-icon"
                                        class="user-list-icon">
									<div class="user-list-icons-option d-none" id="ul-oc-${id}"><span id="ul-o-f-${id}">Pin</span>
									${userId != id && (userAuthority == 1 || userAuthority == 2) ? `<span id="ul-o-k-${id}">${kickTitle == "id" ? "Keluarkan" : "Remove"}}</span>` : ""}
									</div>
                                </div>
                            `

			if (userId != id) {
				this.createChat({ id, username, createChatContainer: true, createChatTo: true })
			}

			document.getElementById("users-list-container").appendChild(userListElement)
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	static methodAddViewerList({ id, username }) {
		try {
			if (!document.getElementById(`ul-${id}`)) {
				const alphabetUsername = this.getInitialsAndColor(username)
				let viewerListElement = document.createElement("div")

				// let authorityElement = ``
				// const kickTitle = localStorage.getItem("language")

				viewerListElement.className = "user-list-content"
				viewerListElement.id = `ul-${id}`
				viewerListElement.innerHTML = `
									<div class="user-list-profile">
										<span id="color-${id}" style="color: ${alphabetUsername.color};" class="user-list-picture">${alphabetUsername.initials}</span>
										<span class="user-list-username">${username}</span>
									</div>
									<div class="user-list-icons">
									</div>
								`
				document.getElementById("viewer-list-container").appendChild(viewerListElement)
			}
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	static getViewerFeatere() {
		try {
		} catch (error) {
			console.log("- Error Viewer Feature : ", error)
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

	static normalHideAndDisplay({ element, status }) {
		try {
			if (status) {
				element.classList.remove("d-none")
			} else {
				if (!element.classList.contains("d-none")) {
					element.classList.add("d-none")
				}
			}
		} catch (error) {
			console.log("- Error Normal Hide/Display : ", error)
		}
	}

	static hideUserOptionButton() {
		try {
			const allOptionUserList = document.querySelectorAll(".user-list-icons-option")
			allOptionUserList.forEach((e) => {
				try {
					if (!e.classList.contains("d-none")) {
						e.classList.add("d-none")
					}
				} catch (error) {
					console.log("- Error Hide It : ", error)
				}
			})
		} catch (error) {
			console.log("- Error Hide User Option Button : ", error)
		}
	}
}

class Users extends StaticEvent {
	#os = ""
	#picture = ""
	#username = ""
	#users
	#authority
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
	#muteAllStatus = false

	#record = null

	// Record
	#timerCounter
	#timerFunction
	#startTime
	#elapsedTime

	// Layout Video
	#layoutVideoOptions
	#layoutCountContainer

	// Speech To Text
	#speechToText = {
		word: [],
		words: [],
		recognition: null,
		speechRecognitionList: null,
		maxWords: 15,
	}

	#faceRecognition
	#faceRecognitionInterval
	constructor() {
		super()

		// Layout Petak = 1, pembicara = 2, layout petaksamping = 3
		this.#picture = ""
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

		this.#record = {
			isRecording: false,
			stream: null,
			audioContext: null,
			audioDestination: null,
			recordedStream: null,
			recordedMedia: null,
		}

		// Record
		this.#timerCounter = "00:00:00"
		this.#elapsedTime = 0
	}

	get os() {
		return this.#os
	}

	set os(newOs) {
		this.#os = newOs
	}

	get currentPage() {
		return this.#currentPage
	}

	get currentLayout() {
		return this.#currentLayout
	}

	get record() {
		return this.#record
	}

	get faceRecognition() {
		return this.#faceRecognition
	}

	set faceRecognition(input) {
		this.#faceRecognition = input
	}
	get muteAllStatus() {
		return this.#muteAllStatus
	}

	set muteAllStatus(status) {
		this.#muteAllStatus = status
	}

	get username() {
		return this.#username
	}

	set username(name) {
		this.#username = name
	}

	get picture() {
		return this.#picture
	}

	set picture(newName) {
		this.#picture = newName
	}

	get userId() {
		return this.#userId
	}

	set userId(id) {
		this.#userId = id
	}

	get authority() {
		return this.#authority
	}

	set authority(authorityInput) {
		this.#authority = authorityInput
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

	async getCurrentVideoDisplayed() {
		// return document.querySelectorAll('[id^="vc-"]:not(.d-none)').length
		return document.querySelectorAll('#video-collection > [id^="vc-"]:not(.d-none)')
	}

	async createMicUserSvg({ id }) {
		return `
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<mask id="mask0" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
					<path d="M5 3C5 2.20435 5.31607 1.44129 5.87868 0.87868C6.44129 0.31607 7.20435 0 8 0C8.79565 0 9.55871 0.31607 10.1213 0.87868C10.6839 1.44129 11 2.20435 11 3V8C11 8.79565 10.6839 9.55871 10.1213 10.1213C9.55871 10.6839 8.79565 11 8 11C7.20435 11 6.44129 10.6839 5.87868 10.1213C5.31607 9.55871 5 8.79565 5 8V3Z" fill="#9CA3AF"/>
					<path d="M3.5 6.5C3.63261 6.5 3.75979 6.55268 3.85355 6.64645C3.94732 6.74021 4 6.86739 4 7V8C4 9.06087 4.42143 10.0783 5.17157 10.8284C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8284C11.5786 10.0783 12 9.06087 12 8V7C12 6.86739 12.0527 6.74021 12.1464 6.64645C12.2402 6.55268 12.3674 6.5 12.5 6.5C12.6326 6.5 12.7598 6.55268 12.8536 6.64645C12.9473 6.74021 13 6.86739 13 7V8C13 9.23953 12.5396 10.4349 11.7081 11.3541C10.8766 12.2734 9.73332 12.851 8.5 12.975V15H11.5C11.6326 15 11.7598 15.0527 11.8536 15.1464C11.9473 15.2402 12 15.3674 12 15.5C12 15.6326 11.9473 15.7598 11.8536 15.8536C11.7598 15.9473 11.6326 16 11.5 16H4.5C4.36739 16 4.24021 15.9473 4.14645 15.8536C4.05268 15.7598 4 15.6326 4 15.5C4 15.3674 4.05268 15.2402 4.14645 15.1464C4.24021 15.0527 4.36739 15 4.5 15H7.5V12.975C6.26668 12.851 5.12337 12.2734 4.29188 11.3541C3.46038 10.4349 2.99998 9.23953 3 8V7C3 6.86739 3.05268 6.74021 3.14645 6.64645C3.24021 6.55268 3.36739 6.5 3.5 6.5Z" fill="#9CA3AF"/>
				</mask>
				<g mask="url(#mask0)">
					<rect width="16" height="16" fill="#9CA3AF"/>
					<rect id="video-mic-${id}" y="16" width="16" height="16" fill="#2D8CFF"/>
				</g>
				<line id="video-mic-muted-${id}" class="d-none" x1="2" y1="14" x2="14" y2="2" stroke="#FF3B30" stroke-width="1" stroke-linecap="round"/>
			</svg>

		`
	}

	async findAdmin() {
		try {
			const authority = this.#allUsers.filter((u) => u.authority == 1 || u.authority == 2)
			return authority
		} catch (error) {
			console.log("- Error Check Permission Screen Sharing : ", error)
		}
	}

	async increaseTotalDisplayedVideo() {
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
			// document.getElementById("previous-number").innerHTML = this.#currentPage <= 1 ? 1 : this.#currentPage - 1 == 0 ? 1 : this.#currentPage - 1
			document.getElementById("previous-number").innerHTML = Math.max(1, this.#currentPage - 1)
			document.getElementById("next-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage + 1
			document.getElementById("down-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage + 1
			document.getElementById("up-number").innerHTML = this.#currentPage == this.#totalPage ? this.#totalPage : this.#currentPage - 1
		} catch (error) {
			console.log("- Error Change Max Page : ", error)
		}
	}

	async updatePageInformation() {
		try {
			const allVideo = document.querySelectorAll('[id^="vc-"]').length

			if (this.#currentLayout == 1) {
				this.#totalPage = Math.ceil(allVideo / this.#totalLayout)
				// this.#totalPage = Math.ceil(this.#users / this.#totalLayout)
				await this.changeMaxPage()
			} else if (this.#currentLayout == 2) {
				console.log("- Do Nothing")
			} else if (this.#currentLayout == 3) {
				this.#totalLayout = 5
				this.#totalPage = Math.ceil(allVideo / this.#totalLayout)
				// this.#totalPage = Math.ceil(this.#users / this.#totalLayout)
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

	async addVideo({ userId, track, index = null, username, meetingType = null, picture }) {
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
				let faceRecognition = `<div class="face-recognition" id="face-recognition-${userId}"></div>`

				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = this.#currentLayout == 1 ? this.#currentVideoClass : "video-user-container-focus-user"

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"

				userVideoElement.innerHTML = `<div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video"></video>${faceRecognition}</div>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainer.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = username
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				microphoneElement.innerHTML = `<img class="video-mic-image" src="${baseUrl}/assets/icons/mic_level_3.svg" id="video-mic-${userId}" alt="mic_icon"/>`
				userVideoElement.appendChild(microphoneElement)

				await this.increaseTotalDisplayedVideo()
				if (!userId.startsWith("ssv_")) {
					if (this.#faceRecognition) {
						await this.startFR({ picture: `${baseUrl}/photo/${picture}.png`, id: userId, name: username })
					}
				}
				// await this.adjustFR()
			}

			if (track) {
				await this.insertVideo({ track, id: userId })
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

	async addVideoSecondMethod({ userId, track = null, username, picture, isActive = true }) {
		try {
			const currentVideoDisplayed = await this.getCurrentVideoDisplayed()
			if (!this.#videoContainerFocus.classList.contains("d-none") && this.#currentLayout == 1) {
				this.#videoContainerFocus.classList.add("d-none")
			}

			const checkUserElement = document.getElementById(`vc-${userId}`)
			if (!checkUserElement) {
				const alphabetName = await this.constructor.getInitialsAndColor(username)
				let faceRecognition = `<div class="face-recognition" id="face-recognition-${userId}"></div>`

				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				if (currentVideoDisplayed.length < this.#totalLayout) {
					videoContainerElement.className = `${this.#currentVideoClass}`
				} else {
					videoContainerElement.className = `${this.#currentVideoClass} d-none`
				}

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"
				userVideoElement.id = `user-container-${userId}`

				userVideoElement.innerHTML = `<div class="d-none video-turn-off" id="turn-off-${userId}">
				<span class="turn-off-alphabet" style="color: ${document.getElementById(`color-${userId}`)?.style?.color || alphabetName.color};">
				${alphabetName.initials}</span></div><div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video">
				</video>${faceRecognition}</div>`
				// userVideoElement.innerHTML = `<div class="d-none video-turn-off" id="turn-off-${userId}"><img src="${window.location.origin}/photo/P_0000000.png" class="turn-off-picture"/></div><div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video"></video>${faceRecognition}</div>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainer.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = username
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				// microphoneElement.innerHTML = `<img class="video-mic-image" src="${baseUrl}/assets/icons/mic_level_3.svg" id="video-mic-${userId}" alt="mic_icon"/>`
				microphoneElement.innerHTML = await this.createMicUserSvg({ id: userId })
				userVideoElement.appendChild(microphoneElement)

				if (!track) {
					document.getElementById(`turn-off-${userId}`).classList.remove("d-none")
				}

				await this.increaseTotalDisplayedVideo()
				if (!userId.startsWith("ssv_")) {
					if (this.#faceRecognition) {
						await this.startFR({ picture: `${baseUrl.origin}/photo/${picture}.png`, id: userId, name: username })
					}
				}
			}
			if (track) {
				await this.insertVideo({ track, id: userId })
			}

			if (isActive && track) {
				document.getElementById(`turn-off-${userId}`).classList.add("d-none")
			}

			await this.updateVideoCurrentClass()
			if (this.#currentLayout == 1) {
				await this.updateAllVideoSecondMethod()
			}
			await this.updateVideoPreviousClass()
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async addFocusVideo({ userId, track, username }) {
		try {
			const checkUserElement = document.getElementById(`vc-${userId}`)
			this.#videoContainerFocus.classList.remove("d-none")
			if (!checkUserElement) {
				const alphabetName = await this.constructor.getInitialsAndColor(username)
				let faceRecognition = `<div class="face-recognition" id="face-recognition-${userId}"></div>`

				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = `video-user-container-1`

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"

				// userVideoElement.innerHTML = `<div class="d-none video-turn-off" id="turn-off-${userId}"><img src="${window.location.origin}/photo/P_0000000.png" class="turn-off-picture"/></div><div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video"></video>${faceRecognition}</div>`
				userVideoElement.innerHTML = `<div class="d-none video-turn-off" id="turn-off-${userId}">
				<span class="turn-off-alphabet" style="color: ${document.getElementById(`color-${userId}`).style.color};">
				${alphabetName.initials}</span>
				</div><div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video"></video>${faceRecognition}</div>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainerFocus.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = username
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				microphoneElement.innerHTML = `<img class="video-mic-image" src="${baseUrl}/assets/icons/mic_level_3.svg" id="video-mic-${userId}" alt="mic_icon"/>`
				userVideoElement.appendChild(microphoneElement)

				await this.insertVideo({ track, id: userId })

				if (!userId.startsWith("ssv_")) {
					if (this.#faceRecognition) {
						await this.startFR({ picture: `${baseUrl.origin}/photo/${picture}.png`, id: userId, name: username })
					}
				}
			}
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async addFocusVideoSecondMethod({ userId, track, username }) {
		try {
			const checkUserElement = document.getElementById(`vc-${userId}`)
			this.#videoContainerFocus.classList.remove("d-none")
			if (!checkUserElement) {
				const alphabetName = await this.constructor.getInitialsAndColor(username)
				let faceRecognition = `<div class="face-recognition" id="face-recognition-${userId}"></div>`

				let videoContainerElement = document.createElement("div")
				videoContainerElement.id = `vc-${userId}`
				videoContainerElement.className = `video-user-container-1`

				let userVideoElement = document.createElement("div")
				userVideoElement.className = "user-container"

				userVideoElement.innerHTML = `<div class="d-none video-turn-off" id="turn-off-${userId}">
				<span class="turn-off-alphabet" style="color: ${document.getElementById(`color-${userId}`)?.style?.color || alphabetName.color};">
				${alphabetName.initials}</span></div><div class="video-wrapper"><video id="v-${userId}" muted autoplay class="user-video">
				</video>${faceRecognition}</div>`
				videoContainerElement.appendChild(userVideoElement)
				this.#videoContainerFocus.appendChild(videoContainerElement)

				let usernameElement = document.createElement("span")
				usernameElement.id = `vu-${userId}`
				usernameElement.className = "video-username"
				usernameElement.innerHTML = username
				userVideoElement.appendChild(usernameElement)

				let microphoneElement = document.createElement("div")
				microphoneElement.className = "video-mic-icon"
				microphoneElement.innerHTML = `<img class="video-mic-image" src="${baseUrl}/assets/icons/mic_level_3.svg" id="video-mic-${userId}" alt="mic_icon"/>`
				userVideoElement.appendChild(microphoneElement)

				await this.insertVideo({ track, id: userId })

				if (!userId.startsWith("ssv_")) {
					if (this.#faceRecognition) {
						await this.startFR({ picture: `${baseUrl}/photo/${picture}.png`, id: userId, name: username })
					}
				}
				return false
			} else {
				checkUserElement.className = `video-user-container-1`
				checkUserElement.classList.remove("d-none")
				this.#videoContainerFocus.prepend(checkUserElement)
				return true
			}
		} catch (error) {
			console.log("- Error Add My Video : ", error)
		}
	}

	async insertVideo({ track, id, count = 0 }) {
		try {
			if (track.kind !== "video") {
				throw new Error("Provided track is not a video track")
			}

			// const pictureVideo = document.getElementById(`turn-off-${id}`)
			// if (pictureVideo) {
			// 	pictureVideo.classList.add("d-none")
			// }

			const videoElement = document.getElementById("v-" + id)
			if (videoElement?.srcObject?.getVideoTracks()[0]) {
				return
			}

			if (!videoElement && count < 50) {
				let counter = 0
				if (count != 0) {
					counter = count + 1
				}
				await this.insertVideo({ track, id, count: counter })
			}
			if (videoElement) {
				videoElement.muted = true
				const mediaStream = new MediaStream([track])
				videoElement.srcObject = mediaStream

				videoElement.onerror = (event) => {
					console.log("Video playback error: ", event)
				}
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
				// if (typeof audioElement.setSinkId !== "undefined") {
				// 	audioElement
				// 		.setSinkId(this.#sinkId)
				// 		.then(() => {
				// 			console.log(`Success, audio output device attached: ${this.#sinkId}`)
				// 		})
				// 		.catch((error) => {
				// 			let errorMessage = error
				// 			if (error.name === "SecurityError") {
				// 				errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`
				// 			}
				// 			console.error(errorMessage)
				// 		})
				// } else {
				// 	console.warn("Browser does not support output device selection.")
				// }
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

	async deleteVideoSecondMethod({ userId }) {
		try {
			const checkUserElement = document.getElementById(`vc-${userId}`)

			if (checkUserElement) {
				const tracks = await document.getElementById(`v-${userId}`)?.srcObject?.getTracks()

				if (tracks) {
					tracks.forEach((track) => {
						track.stop()
					})
				}

				checkUserElement.remove()
				await this.updateVideoCurrentClass()
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
				const checkUserAduioElement = document.getElementById(`ac-${userId}`)
				checkUserAduioElement.remove()
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

	async updateAllVideoSecondMethod() {
		try {
			const currentVideoDisplayed = await this.getCurrentVideoDisplayed()
			currentVideoDisplayed.forEach((e) => {
				currentVideoDisplayed.forEach((e) => {
					e.classList.forEach((className) => {
						if (className.startsWith("video-user-container-")) {
							e.classList.replace(className, this.#currentVideoClass)
						}
					})
				})
			})
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async updateVideoCurrentClass() {
		try {
			if (this.#currentLayout == 3) {
				this.#currentVideoClass = `video-user-container-focus-user`
				return
			}
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
				if (this.#users == 1) {
					await document.getElementById("layout-2").click()
				}
				this.constructor.warning({
					message:
						localStorage.getItem("language") == "id"
							? "Tidak bisa memilih layout petak pada saat berbagi layar"
							: "Cannot change the tiles layout in screen sharing mode",
				})
				return
			}

			if (container.dataset.option == 3 && this.#users == 1) {
				this.constructor.warning({
					message:
						localStorage.getItem("language") == "id"
							? "Tidak bisa memilih layout karena hanya ada 1 user"
							: "Cannot select a layout because there is only one user",
				})
				return
			}

			document.querySelectorAll(".layout-option-container").forEach((c) => {
				const radio = c.querySelector(".radio")
				if (c === container) {
					radio.src = `${baseUrl}/assets/icons/radio_button_active.svg`
					this.#currentLayout = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/radio_button.svg`
				}
			})
			await this.statusLayoutCount()
			await this.updateVideoSecondMethod({ socket })
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

	async addAllUser({
		userId,
		authority,
		username,
		consumerId = null,
		kind = null,
		track = null,
		socketId,
		focus = false,
		socket,
		index = null,
		isViewer = false,
		appData = null,
	}) {
		try {
			let triggerPush = true
			if (isViewer) {
				this.constructor.methodAddViewerList({ id: userId, username })
				return
			}
			if (!this.#allUsers.some((u) => u.userId == userId)) {
				this.#allUsers.push({
					userId,
					isViewer,
					authority,
					socketId,
					consumer: [
						{ kind, id: consumerId, track, appData, focus },
						{
							kind: kind == "audio" ? "video" : "audio",
							id: "",
							track: null,
							appData: { label: kind == "audio" ? "video" : "audio", isActive: false, picture: "" },
							focus: false,
						},
					],
					username,
					frInterval: null,
				})
				if (consumerId != null) {
					await this.increaseUsers()
				}
				if (kind == "video") {
					await this.addVideoSecondMethod({ username, userId, track: null, index, picture: appData.picture, isActive: appData.isActive })
				}
				// await this.addVideo({ username, userId, track: null, index, picture: appData.picture })

				await this.constructor.methodAddUserList({
					id: userId,
					username: username,
					authority: authority,
					picture: appData?.picture,
					userId: this.#userId,
					userAuthority: this.#authority,
				})
				if ((this.#authority == 1 || this.#authority == 2) && userId != this.#userId) {
					const optionKickUser = document.getElementById(`ul-o-k-${userId}`)
					optionKickUser.addEventListener("click", (e) => {
						try {
							e.stopPropagation()
							socket.emit("kick-user", { to: socketId, message: "Anda telah di dikeluarkan dari ruangan" })
						} catch (error) {
							console.log("- Error Kick User : ", error)
						}
					})
				}
				const optionUserList = document.getElementById(`ul-o-${userId}`)
				optionUserList.addEventListener("click", (e) => {
					e.stopPropagation()
					this.constructor.hideUserOptionButton()
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
						if (this.#screenSharingMode) {
							this.constructor.warning({
								message:
									localStorage.getItem("language") == "id"
										? "Tidak bisa memilih layout pada saat berbagi layar"
										: "Cannot change the selected layout in screen sharing mode",
							})
							return
						}
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
						this.#currentLayout = 2
						document.querySelectorAll(".layout-option-container").forEach((c) => {
							const radio = c.querySelector(".radio")
							if (c.dataset.option == 2) {
								radio.src = `${baseUrl}/assets/icons/radio_button_active.svg`
							} else {
								radio.src = `${baseUrl}/assets/icons/radio_button.svg`
							}
						})
						await this.statusLayoutCount()
						await this.updateVideoSecondMethod({ socket })
					} catch (error) {
						console.log("- Error Option User List Container : ", error)
					}
				})
				await this.addVideoSecondMethod({ username, userId, track: null, index, picture: appData.picture, isActive: appData.isActive })
				triggerPush = false
			}
			if (kind == "audio" && consumerId == null && appData.label == "audio") {
				// await this.createAudio({ id: userId, track })
				await this.createAudioVisualizer({ id: userId, track })
			}

			// if (triggerPush) {
			// 	const user = this.#allUsers.find((u) => u.userId == userId)
			// 	user.consumer.push({ kind, id: consumerId, track, appData, focus })
			// }

			if (triggerPush) {
				const user = this.#allUsers.find((u) => u.userId === userId)
				if (user) {
					if (appData && (appData.label == "screensharing_audio" || (appData && appData.label == "screensharing_video"))) {
						user.consumer.push({ kind, id: consumerId, track, appData, focus })
					} else {
						user.consumer = user.consumer.filter((c) => c.kind !== kind)
						user.consumer.push({ kind, id: consumerId, track, appData, focus })
					}
				}
			}

			if (kind == "audio" && consumerId && appData.label == "audio") {
				await this.createAudio({ id: userId, track })
				await this.createAudioVisualizer({ id: userId, track })
			}
			if (kind == "video" && appData.label == "video") {
				await this.addVideoSecondMethod({ username, userId, track, index, picture: appData.picture, isActive: appData.isActive })
			}

			if (appData && appData.label == "screensharing_audio") {
				await this.createAudio({ id: "ssa_" + userId, track })
				const audioSource = this.#record.audioContext.createMediaStreamSource(new MediaStream([track]))
				audioSource.connect(this.#record.audioDestination)
			}

			if (appData && appData.label == "screensharing_video") {
				await this.increaseUsers()
				await this.addVideoSecondMethod({ username, userId: "ssv_" + userId, track, index, picture: null })
			}
			await this.updatePageInformation()
		} catch (error) {
			console.log("- Error Add User : ", error)
		}
	}

	async deleteAllUser({ userId }) {
		try {
			let isScreenSharing = false
			let changeFocus = false

			const user = this.#allUsers.find((u) => u.userId == userId)

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

			this.#users = this.#allUsers.filter((u) => !u.isViewer).length

			if (changeFocus && this.#allUsers.length > 0) {
				this.#allUsers[0].consumer.forEach((c) => {
					if (c.kind == "video") {
						c.focus = true
					}
				})
			}
			this.constructor.updateTotalUserList({ total: this.#users })
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
		// if (this.#users == 0) {
		// 	this.#users = 1
		// }
		this.#users = this.#users + 1
		// console.log("AFTER", this.#users)
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
					radio.src = `${baseUrl}/assets/icons/mini_radio_active.svg`
					this.#totalLayout = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/mini_radio.svg`
				}
			})

			this.#currentPage = 1
			await this.updateVideoSecondMethod({ socket })
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async previousVideo({ socket }) {
		try {
			await this.updatePageInformation()
			if (this.#currentPage <= 1) {
				return
			}
			this.#currentPage = this.#currentPage - 1
			await this.updateVideoSecondMethod({ socket })
		} catch (error) {
			console.log("- Error Previous Video : ", error)
		}
	}

	async nextVideo({ socket }) {
		try {
			await this.updatePageInformation()
			if (this.#currentPage >= this.#totalPage) {
				return
			}
			this.#currentPage = this.#currentPage + 1
			await this.updateVideoSecondMethod({ socket })
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
					// this.#totalLayout = 6
					this.#layoutCountContainer.forEach((c) => {
						if (c.firstElementChild.src.endsWith(`${baseUrl}/assets/icons/mini_radio_active.svg`)) {
							this.#totalLayout = c.dataset.option
						}
					})
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
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					// let track = u.consumer.find((t) => t.kind == "video")
					for (const track of tracks) {
						if (customIndex + 1 >= min && customIndex + 1 <= max) {
							await this.addVideo({ username: u.username, userId: u.userId, track: track.track, picture: track?.appData?.picture })
							await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })

							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							if (track && track?.id) {
								socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.pause()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
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
				await this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: false })
				this.#allUsers.forEach(async (u) => {
					let tracks = u.consumer.filter((t) => t.kind == "video")
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					for (const track of tracks) {
						if (track.focus) {
							await this.addFocusVideo({
								userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId,
								track: track.track,
								username: u.username,
							})
							await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
								try {
									if (status) {
										track.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
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
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")
					for (const track of tracks) {
						if (track.focus) {
							await this.addFocusVideo({
								track: track.track,
								userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId,
								username: u.username,
							})
							await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else if (customIndex + 1 >= min && customIndex + 1 <= max) {
							customIndex++
							await this.addVideo({ username: u.username, userId: u.userId, track: track.track, picture: track?.appData?.picture })
							await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							customIndex++
							socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
								try {
									if (status) {
										track.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}
					}
				})
				if (this.#users == 1) {
					await document.getElementById("layout-1").click()
				}
			}
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async updateVideoSecondMethod({ socket }) {
		try {
			let customIndex = 0
			await this.updateVideoContainerLayout()
			if (this.#videoContainerFocus.children.length > 0) {
				this.#videoContainer.prepend(this.#videoContainerFocus.children[0])
			}
			if (this.#currentLayout == 1) {
				this.#videoContainer.classList.remove("d-none")
				if (!this.#videoContainerFocus.classList.contains("d-none")) {
					this.#videoContainerFocus.classList.add("d-none")
				}
				// if (this.#videoContainerFocus.children.length > 0) {
				// 	this.#videoContainer.prepend(this.#videoContainerFocus.children[0])
				// }

				if (this.#totalLayout == 5) {
					// this.#totalLayout = 6
					this.#layoutCountContainer.forEach((c) => {
						if (c.firstElementChild.src.endsWith(`${baseUrl}/assets/icons/mini_radio_active.svg`)) {
							this.#totalLayout = c.dataset.option
						}
					})
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
					if (u.isViewer) {
						return
					}
					let tracks = u.consumer.filter((t) => t.kind == "video")
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					// let track = u.consumer.find((t) => t.kind == "video")
					for (const track of tracks) {
						customIndex++
						if (customIndex >= min && customIndex <= max) {
							await this.showHideVideo({ id: u.userId, status: true })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							await this.showHideVideo({ id: u.userId, status: false })
							if (track && track?.id) {
								socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.pause()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						}
					}
				})

				await Promise.all(promises)

				const currentVideoDisplayed = await this.getCurrentVideoDisplayed()

				if (currentVideoDisplayed.length == 0) {
					await this.previousVideo({ socket })
				}
			} else if (this.#currentLayout == 2) {
				await this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: false })
				if (!this.#videoContainer.classList.contains("d-none")) {
					this.#videoContainer.classList.add("d-none")
				}
				this.#allUsers.forEach(async (u) => {
					let tracks = u.consumer.filter((t) => t.kind == "video")
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					for (const track of tracks) {
						if (track.focus) {
							const isMove = await this.addFocusVideoSecondMethod({
								userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId,
								track: track.track,
								username: u.username,
							})
							if (!isMove) {
								await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							}

							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											console.log("- Track : ", track)
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							await this.showHideVideo({ id: u.userId, status: false })
							console.log("- Track : ", track, " - User : ", u)
							socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
								try {
									if (status) {
										track.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}
					}
				})
			} else if (this.#currentLayout == 3) {
				await this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: true })
				this.#totalDisplayedVideo = 0
				await this.updatePageInformation()
				await this.updateVideoContainer()
				this.#videoContainerFocus.classList.remove("d-none")
				this.#videoContainer.classList.remove("d-none")

				this.#allUsers.forEach(async (u) => {
					const min = this.#currentPage * this.#totalLayout - (this.#totalLayout - 1)
					const max = this.#currentPage * this.#totalLayout
					let tracks = u.consumer.filter((t) => t.kind == "video")
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")
					for (const track of tracks) {
						if (!track.focus) {
							customIndex++
						}

						// Focused View
						if (track.focus) {
							const isMove = await this.addFocusVideoSecondMethod({
								track: track.track,
								userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId,
								username: u.username,
							})
							if (!isMove) {
								await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							}
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else if (customIndex >= min && customIndex <= max) {
							// Show video like side bar
							const videoELement = document.getElementById(`vc-${u.userId}`)
							if (videoELement && videoELement.parentElement && videoELement.parentElement.id == "video-container-focus") {
								this.#videoContainer.prepend(videoELement)
							}

							await this.showHideVideo({ id: u.userId, status: true })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							const videoELement = document.getElementById(`vc-${u.userId}`)
							if (videoELement && videoELement.parentElement && videoELement.parentElement.id == "video-container-focus") {
								this.#videoContainer.prepend(videoELement)
							}
							await this.showHideVideo({ id: u.userId, status: false })
							socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
								try {
									if (status) {
										track.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}
					}
				})

				const currentVideoDisplayed = await this.getCurrentVideoDisplayed()

				if (currentVideoDisplayed.length == 0) {
					await this.previousVideo({ socket })
				}
				if (this.#users == 1) {
					await document.getElementById("layout-1").click()
				}

				if (this.#os.toLowerCase() == "android" || this.#os.toLowerCase() == "ios") {
					await this.updateClassVideoMobile()
				}
			}
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async updateVideoSecondMethodHandphone({ socket, focus }) {
		try {
			let customIndex = 0
			await this.updateVideoContainerLayout()
			// console.log("\n- Current Layout : ", this.#currentLayout, "\n- Current Page : ", this.#currentPage, "\n- Total Page : ", this.#totalPage)
			if (!focus) {
				this.#videoContainer.classList.remove("d-none")
				if (!this.#videoContainerFocus.classList.contains("d-none")) {
					this.#videoContainerFocus.classList.add("d-none")
				}
				// if (this.#videoContainerFocus.children.length > 0) {
				// 	this.#videoContainer.prepend(this.#videoContainerFocus.children[0])
				// }

				if (this.#totalLayout == 5) {
					// this.#totalLayout = 6
					this.#layoutCountContainer.forEach((c) => {
						if (c.firstElementChild.src.endsWith(`${baseUrl}/assets/icons/mini_radio_active.svg`)) {
							this.#totalLayout = c.dataset.option
						}
					})
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
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					// let track = u.consumer.find((t) => t.kind == "video")
					for (const track of tracks) {
						if (track.focus) {
							continue
						}
						customIndex++
						if (customIndex >= min && customIndex <= max) {
							await this.showHideVideo({ id: u.userId, status: true })
							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											console.log("- Track : ", track)
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							await this.showHideVideo({ id: u.userId, status: false })
							if (track && track?.id) {
								socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status) {
											track.pause()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						}
					}
				})

				await Promise.all(promises)

				const currentVideoDisplayed = await this.getCurrentVideoDisplayed()

				if (currentVideoDisplayed.length == 0) {
					await this.previousVideo({ socket })
				}
			} else {
				await this.hideShowPreviousNextButton({ status: false })
				await this.hideShowUpDownButton({ status: false })
				if (!this.#videoContainer.classList.contains("d-none")) {
					this.#videoContainer.classList.add("d-none")
				}
				this.#allUsers.forEach(async (u) => {
					let tracks = u.consumer.filter((t) => t.kind == "video")
					let audioTracks = u.consumer.find((t) => t.kind == "audio" && t.appData.label == "audio")

					for (const track of tracks) {
						if (track.focus) {
							const isMove = await this.addFocusVideoSecondMethod({
								userId: track.appData.label == "screensharing_video" ? "ssv_" + u.userId : u.userId,
								track: track.track,
								username: u.username,
							})
							if (!isMove) {
								await this.createAudioVisualizer({ id: u.userId, track: audioTracks?.track })
							}

							if (track && track?.id) {
								socket.emit("consumer-resume", { serverConsumerId: track.id }, async ({ status, message }) => {
									try {
										if (status && message != "producer-paused") {
											console.log("- Track : ", track)
											track.resume()
										}
									} catch (error) {
										console.log("- Error Resuming Consumer : ", error)
									}
								})
							}
						} else {
							await this.showHideVideo({ id: u.userId, status: false })
							socket.emit("consumer-pause", { serverConsumerId: track.id }, async ({ status, message }) => {
								try {
									if (status) {
										track.pause()
									}
								} catch (error) {
									console.log("- Error Resuming Consumer : ", error)
								}
							})
						}
					}
				})
			}

			await this.updateClassVideoMobile()
		} catch (error) {
			console.log("- Error Update Video : ", error)
		}
	}

	async updateClassVideoMobile() {
		try {
			if (this.#currentLayout == 1) {
				await this.updateVideoCurrentClass()
			} else if (this.#currentLayout == 2) {
				if (this.#users < this.#totalLayout) {
					this.#currentVideoClass = `video-user-container-${this.#users - 1}`
				} else {
					this.#currentVideoClass = `video-user-container-${this.#totalLayout}`
				}
			}

			Array.from(this.#videoContainer.children).forEach((element) => {
				element.className = this.#currentVideoClass
			})
		} catch (error) {
			console.log("- Error Update Class Video : ", error)
		}
	}

	async showHideVideo({ status, id }) {
		try {
			const videoElement = document.getElementById(`vc-${id}`)
			if (status) {
				videoElement.classList.remove("d-none")
			} else {
				if (!videoElement.classList.contains("d-none")) {
					videoElement.classList.add("d-none")
				}
			}

			await this.updateVideoCurrentClass()
			if (this.#currentLayout == 1) {
				await this.updateAllVideoSecondMethod()
			}
			if (this.#currentLayout == 3) {
				await this.updateAllVideoSecondMethod()
				const currentVideoDisplayed = await this.getCurrentVideoDisplayed()

				currentVideoDisplayed.forEach((e) => {
					e.classList.forEach((className) => {
						if (className.startsWith("video-user-container-") && e.parentElement.id == "video-collection") {
							e.classList.replace(className, this.#currentVideoClass)
						} else {
							e.classList.replace(className, "video-user-container-1")
						}
					})
				})
			}

			await this.updateVideoPreviousClass()
		} catch (error) {
			console.log("- Error Show or Hide Video : ", error)
		}
	}

	async addForceCloseList({ socket, userId, username, picture }) {
		try {
			let userListElement = document.createElement("div")
			const userListContainerElement = document.getElementById("users-list-container")
			userListElement.className = "user-list-content"
			userListElement.id = `ul-ss-${userId}`
			userListElement.innerHTML = `
                                <div class="user-list-profile">
                                    <img src="${baseUrl}/photo/${picture ? picture : "P_0000000"}.png" alt="user-list-picture"
                                        class="user-list-picture" />
                                    <span class="user-list-username">${username}</span>
                                </div>
                                <div class="user-list-icons">
									<span class="user-list-tag">Layar</span>
									${this.#authority ? `<span id="stop-ss-${userId}" class="user-list-tag-ss">Stop</span>` : ""}
                                </div>
                            `
			await userListContainerElement.insertBefore(userListElement, userListContainerElement.firstChild)
			if (this.#authority && userId != this.#userId) {
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

	async changeScreenSharingMode({ status, userId, socket, username, picture }) {
		try {
			if (status) {
				await this.addForceCloseList({ socket, userId, username, picture })
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
				if (this.#os.toLowerCase() == "android" || this.#os.toLowerCase() == "ios") {
					await document.getElementById("layout-2").click()
				} else {
					await document.getElementById("layout-3").click()
				}
			} else {
				this.#userIdScreenSharing = ""
				this.#screenSharingMode = false
				await this.updateVideoSecondMethod({ socket })
				if (!this.#authority && this.#screenSharingPermission) {
					this.#screenSharingPermission = false
				}
				if (document.getElementById(`ul-ss-${userId}`)) {
					document.getElementById(`ul-ss-${userId}`).remove()
				}
				if (document.getElementById(`ssa-${userId}`)) {
					document.getElementById(`ssa-${userId}`).remove()
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
						user.consumer = user.consumer.filter((c) => {
							if (c.appData.label != "screensharing_video") {
								return c
							}
							if (c.appData.label == "screensharing_video") {
								this.decreaseUsers()
							}
						})
						user.consumer.forEach((c) => {
							if (c.kind == "video" && c.appData.label == "video") {
								c.focus = true
							}
						})
						const screenSharingVideo = document.getElementById(`vc-ssv_${userId}`)
						if (screenSharingVideo) {
							screenSharingVideo.remove()
						}
						this.changeScreenSharingMode({ status: false, userId, socket, username: user.username, picture: user.consumer[0].appData.picture })
					}
					if (label == "screensharing_audio") {
						user.consumer = user.consumer.filter((c) => c.appData.label != "screensharing_audio")
						user.consumer.forEach((c) => {
							if (c.kind == "audio" && c.appData.label == "audio") {
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

	async screenSharingPermissionForAdmin({ socket, userId, socketId, roomId, username }) {
		try {
			const permissionContainer = document.getElementById("screensharing-permissions")

			const newPermission = document.createElement("div")
			newPermission.className = "screensharing-permission"
			newPermission.id = `screensharing-permission-${userId}`

			const permissionTitle = document.createElement("div")
			permissionTitle.className = "permission-title"
			permissionTitle.innerHTML = `${username} ingin berbagi layar`

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
					socket.emit("admin-response", { type: "screen-sharing-permission", id: userId, roomId: roomId })
				} catch (error) {
					console.log("- Error Socket Emit Screen Sharing Permission : ", error)
				}
			}

			const responseAccept = async ({ socket }) => {
				try {
					socket.emit("screensharing-permission", { socketId: socket.id, userId: this.#userId, to: socketId, type: "response", response: true })
					socket.emit("admin-response", { type: "screen-sharing-permission", id: userId, roomId: roomId })
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

			admin.forEach((u) => {
				socket.emit("screensharing-permission", {
					socketId: socket.id,
					userId: this.#userId,
					to: u.socketId,
					type: "request",
					response: false,
					username: this.#username,
				})
			})

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

	async recordMeeting({ from, RecordRTC }) {
		try {
			// if (!from && this.#record.isRecording) {
			// 	return
			// }
			const recordButton = document.getElementById("record-button")
			if (from) {
				await this.constructor.normalHideAndDisplay({ element: document.getElementById("record-container"), status: false })
				recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record.svg`
				recordButton.lastElementChild.innerHTML = localStorage.getItem("language") == "id" ? "Mulai Merekam" : "Start Record"
				this.#record.isRecording = false
			} else if (this.#record.isRecording && !from) {
				await this.constructor.normalHideAndDisplay({ element: document.getElementById("record-container"), status: false })
				recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record.svg`
				recordButton.lastElementChild.innerHTML = localStorage.getItem("language") == "id" ? "Mulai Merekam" : "Start Record"
				// recordButton.removeAttribute("pointer-events")
				this.#record.isRecording = !this.#record.isRecording
			} else {
				await this.constructor.normalHideAndDisplay({ element: document.getElementById("record-container"), status: true })
				recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record_active.svg`
				recordButton.lastElementChild.innerHTML = localStorage.getItem("language") == "id" ? "Berhenti Merekam" : "Stop Record"
				// recordButton.setAttribute("pointer-events", "none")
				this.#record.isRecording = !this.#record.isRecording
			}
			await this.recordMeetingVideo({ RecordRTC })
			await this.timer()
		} catch (error) {
			console.log("- Error Record Meeting : ", error)
		}
	}

	async resetTimer() {
		try {
			const recordButton = document.getElementById("record-button")
			recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record.svg`
			recordButton.lastElementChild.innerHTML = localStorage.getItem("language") == "id" ? "Mulai Merekam" : "Start Record"
			recordButton.removeAttribute("pointer-events")
			await this.constructor.normalHideAndDisplay({ element: document.getElementById("record-container"), status: false })
		} catch (error) {
			console.log("- Error Reset Timer : ", error)
		}
	}

	async timer() {
		try {
			if (!this.#elapsedTime) {
				this.#elapsedTime = 0
			}
			if (this.#record.isRecording) {
				this.#startTime = Date.now() - this.#elapsedTime // Adjust startTime by the elapsed time
				// await this.constructor.normalHideAndDisplay({ element: document.getElementById("resume-record"), status: false })
				// await this.constructor.normalHideAndDisplay({ element: document.getElementById("pause-record"), status: true })

				this.#timerFunction = setInterval(() => {
					let currentTime = Date.now()
					this.#elapsedTime = currentTime - this.#startTime // Update elapsed time
					let hours = Math.floor(this.#elapsedTime / 3600000)
					let minutes = Math.floor((this.#elapsedTime % 3600000) / 60000)
					let seconds = Math.floor((this.#elapsedTime % 60000) / 1000)

					this.#timerCounter = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds

					document.getElementById("timer-span").innerHTML = this.#timerCounter
				}, 1000)
			} else {
				this.#elapsedTime = undefined
				clearInterval(this.#timerFunction)
				document.getElementById("timer-title").innerHTML = "Merekam :"
				// await this.constructor.normalHideAndDisplay({ element: document.getElementById("pause-record"), status: false })
				// await this.constructor.normalHideAndDisplay({ element: document.getElementById("resume-record"), status: true })
				this.#timerCounter = "00:00:00"
				document.getElementById("timer-span").innerHTML = this.#timerCounter
				await this.resetTimer()
			}
		} catch (error) {
			console.log("- Error Start Timer : ", error)
		}
	}

	async recordMeetingVideo({ RecordRTC }) {
		try {
			if (this.#record.isRecording) {
				const videoStream = await navigator.mediaDevices.getDisplayMedia({
					video: {
						cursor: "always",
						displaySurface: "monitor",
						chromeMediaSource: "desktop",
					},
					audio: true,
				})

				let screenSharingStream = new MediaStream()
				videoStream.getTracks().forEach((track) => screenSharingStream.addTrack(track))

				let allAudio = []

				this.#allUsers.forEach((u) => {
					u.consumer.forEach((c) => {
						if (c.track && c.track?.kind == "audio") {
							allAudio.push(c.track)
						}
					})
				})
				let allAudioFlat = allAudio.flatMap((track) => track)
				this.#record.audioContext = new (window.AudioContext || window.webkitAudioContext)()
				this.#record.audioDestination = this.#record.audioContext.createMediaStreamDestination()

				allAudioFlat.forEach((track) => {
					const audioSource = this.#record.audioContext.createMediaStreamSource(new MediaStream([track]))
					audioSource.connect(this.#record.audioDestination)
				})

				screenSharingStream.addTrack(this.#record.audioDestination.stream.getAudioTracks()[0])
				this.#record.recordedStream = screenSharingStream
				this.#record.recordedMedia = new RecordRTC(this.#record.recordedStream, {
					type: "video",
					getNativeBlob: true,
					// videoBitsPerSecond: 250000,
					videoBitsPerSecond: 2500000,
					timeSlice: 5000,
					ondataavailable: (blob) => {
						// socket.send({ type: 'collecting', data: blob })
						console.log("- Blob : ", blob)
					},
				})

				this.#record.recordedMedia.startRecording()
				this.#record.recordedStream.getAudioTracks()[0].onended = () => {
					console.log("- Reset Audio Recording")
					this.#record.audioContext = null
					this.#record.audioDestination = null
					this.#record.isRecording = false
					this.timer()
				}

				this.#record.recordedStream.getVideoTracks()[0].onended = () => {
					this.#record.recordedMedia.stopRecording(() => {
						// socket.send({ type: 'uploading' })
						this.#record.isRecording = false
						let blob = this.#record.recordedMedia.getBlob()

						const currentDate = new Date()
						const formattedDate = currentDate
							.toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})
							.replace(/\//g, "")
						const file = new File([blob], formattedDate, {
							type: "video/mp4",
						})
						RecordRTC.invokeSaveAsDialog(file, file.name)
						this.#record.recordedStream.getTracks().forEach((track) => track.stop())
						this.#record.recordedStream = null
						this.#record.recordedMedia.reset()
						this.#record.recordedMedia = null
						this.timer()
					})
				}
			} else {
				this.#record.recordedMedia.stopRecording(() => {
					this.#record.isRecording = false
					let blob = this.#record.recordedMedia.getBlob()

					const currentDate = new Date()
					const formattedDate = currentDate
						.toLocaleDateString("en-GB", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						})
						.replace(/\//g, "")
					const file = new File([blob], formattedDate, {
						type: "video/mp4",
					})
					RecordRTC.invokeSaveAsDialog(file, file.name)
					this.#record.recordedStream.getTracks().forEach((track) => track.stop())
					this.#record.recordedStream = null
					this.#record.recordedMedia.reset()
					this.#record.recordedMedia = null
					this.timer()
				})
			}
		} catch (error) {
			await this.resetTimer()
			if (error == "NotAllowedError: Permission denied") {
				this.#record.isRecording = false
			}
			console.log("- Error Record Meeting Video : ", error)
		}
	}

	async createAudioVisualizer({ id, track }) {
		try {
			if (!track) {
				return
			}
			const audioVisualizer = document.getElementById(`video-mic-${id}`)
			const audioVisualizerMuted = document.getElementById(`video-mic-muted-${id}`)
			if (!audioVisualizer) {
				setTimeout(() => {
					this.createAudioVisualizer({ id, track })
				}, 3000)
				return
			}
			if (audioVisualizer) {
				// Access the microphone audio stream (replace with your stream source)
				const audioContext = new (window.AudioContext || window.webkitAudioContext)()
				const analyser = audioContext.createAnalyser()
				analyser.fftSize = 256
				const bufferLength = analyser.frequencyBinCount
				const dataArray = new Uint8Array(bufferLength)
				let newTheAudio = new MediaStream([track])

				const audioSource = audioContext.createMediaStreamSource(newTheAudio)
				audioSource.connect(analyser)

				const color = "ffffff"
				const userVideoContainer = document.getElementById(`user-container-${id}`)

				function drawBar() {
					analyser.getByteFrequencyData(dataArray)
					const barHeight = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

					if (!track.enabled) {
						if (audioVisualizerMuted.classList.contains("d-none")) {
							audioVisualizerMuted.classList.remove("d-none")
						}
						audioVisualizer.setAttribute("y", 16)
					} else {
						if (!audioVisualizerMuted.classList.contains("d-none")) {
							audioVisualizerMuted.classList.add("d-none")
						}
						const thresholds = [
							{ max: 3, y: 16 },
							{ max: 6, y: 14 },
							{ max: 9, y: 12 },
							{ max: 12, y: 10 },
							{ max: 15, y: 8 },
							{ max: 18, y: 6 },
							{ max: 21, y: 4 },
							{ max: 24, y: 2 },
							{ max: 27, y: 1 },
						]

						const match = thresholds.find((t) => barHeight <= t.max)

						audioVisualizer.setAttribute("y", match ? match.y : 0)
					}

					if (barHeight >= 15) {
						userVideoContainer.style.outline = `1px solid #${color}`
					} else {
						userVideoContainer.style.outline = ``
					}

					requestAnimationFrame(drawBar)
				}

				await drawBar()
			}
		} catch (error) {
			console.log("- Error Creating Audio Level : ", error)
		}
	}

	async getLabeledFaceDescriptions({ picture, name }) {
		const descriptions = []

		for (let i = 1; i <= 2; i++) {
			const img = await faceapi.fetchImage(picture)

			// Detect single face and directly get descriptors using tinyFaceDetector
			const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())

			if (detection) {
				// Extract the descriptor from the detection
				const descriptor = await faceapi.computeFaceDescriptor(img)
				if (descriptor) {
					descriptions.push(descriptor)
				}
			}
		}

		return new faceapi.LabeledFaceDescriptors(name, descriptions)
	}

	async startFR({ picture, name, id }) {
		try {
			// Remove existing canvas if already present
			const existingCanvas = document.getElementById(`cfr-${id}`)
			if (existingCanvas) {
				// existingCanvas.remove()
				return
			}

			const user = await this.#allUsers.find((u) => u.userId == id)
			const video = document.getElementById(`v-${id}`)

			if (video) {
				video.addEventListener("play", async () => {
					const existingCanvasOnPlay = document.getElementById(`cfr-${id}`)

					if (existingCanvasOnPlay) {
						return
					}
					// Load lightweight face detection model
					const labeledFaceDescriptors = await this.getLabeledFaceDescriptions({ picture, name })
					const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45)

					// Create a canvas overlay for face recognition
					const canvas = faceapi.createCanvasFromMedia(video)
					canvas.id = `cfr-${id}`
					document.getElementById(`face-recognition-${id}`).appendChild(canvas)

					const displaySize = { width: video.videoWidth, height: video.videoHeight }
					faceapi.matchDimensions(canvas, displaySize)

					// Throttle face recognition interval
					user.frInterval = setInterval(async () => {
						// Detect all faces with tinyFaceDetector
						const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())

						// Compute face descriptors for each detected face
						const detectionsWithDescriptors = await Promise.all(
							detections.map(async (detection) => {
								const descriptor = await faceapi.computeFaceDescriptor(video, detection)
								return { detection, descriptor }
							})
						)

						// Resize results to match video dimensions
						const resizedDetections = detectionsWithDescriptors.map(({ detection, descriptor }) => ({
							detection: faceapi.resizeResults(detection, displaySize),
							descriptor,
						}))

						// Clear canvas for the next frame
						const ctx = canvas.getContext("2d")
						ctx.clearRect(0, 0, canvas.width, canvas.height)

						// Process detections with descriptors
						resizedDetections.forEach(({ detection, descriptor }) => {
							const result = faceMatcher.findBestMatch(descriptor)
							const box = detection.box

							const drawBox = new faceapi.draw.DrawBox(box, {
								label: result.toString(),
								boxColor: result._distance <= 0.45 ? "blue" : "red",
								drawLabelOptions: { fontSize: 8 },
								lineWidth: 0.2,
							})
							drawBox.draw(canvas)
						})
					}, 500)
				})
			}
		} catch (error) {
			console.log("- Error Starting Face Recognition : ", error)
		}
	}

	async startFRSecondMethod({ picture, name, id, track }) {
		try {
			const video = document.createElement("video")
			video.id = `temporary-video-fr-${id}`
			video.srcObject = new MediaStream([track])
			video.muted = true // Mute to prevent audio feedback
			video.style.display = "none" // Hide the video element
			document.body.appendChild(video) // Add to the DOM temporarily

			// Wait for the video to load metadata
			await new Promise((resolve, reject) => {
				video.onloadedmetadata = () => resolve()
				video.onerror = (err) => reject(err)
			})

			// Prepare face recognition
			const labeledFaceDescriptors = await this.getLabeledFaceDescriptions({ picture, name })
			const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.45)

			// Create a canvas for face recognition overlays
			const canvas = faceapi.createCanvasFromMedia(video)
			const displaySize = { width: video.videoWidth, height: video.videoHeight }
			faceapi.matchDimensions(canvas, displaySize)

			// Start face recognition interval
			const frInterval = setInterval(async () => {
				const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
				const resizedDetections = faceapi.resizeResults(detections, displaySize)

				// Draw overlays
				const ctx = canvas.getContext("2d")
				ctx.clearRect(0, 0, canvas.width, canvas.height)
				resizedDetections.forEach((detection, i) => {
					const result = faceMatcher.findBestMatch(detection.descriptor)
					const box = detection.detection.box
					const drawBox = new faceapi.draw.DrawBox(box, {
						label: result.toString(),
						boxColor: result._distance <= 0.45 ? "blue" : "red",
						drawLabelOptions: { fontSize: 8 },
						lineWidth: 0.2,
					})
					drawBox.draw(canvas)
				})
			}, 100)

			// Capture canvas stream and combine with input track's audio
			const annotatedStream = canvas.captureStream()
			const audioTrack = track.kind === "audio" ? track : null // Use the audio track if it's part of the input
			if (audioTrack) {
				annotatedStream.addTrack(audioTrack)
			}

			// Cleanup: Remove the hidden video element and stop the interval
			video.remove() // Remove video element from DOM
			clearInterval(frInterval) // Clear the interval

			// Return the combined stream
			return annotatedStream
		} catch (error) {
			console.error("- Error Starting Face Recognition with Track: ", error)
			throw error
		}
	}

	async adjustFR() {
		try {
			this.#videoContainer.childNodes.forEach((a) => {
				a.childNodes.forEach((b) => {
					b.childNodes.forEach((c) => {
						if (c.id.startsWith("face-recognition")) {
							const parentWidth = c.parentNode.clientWidth
							// console.log("- Parent Width : ", parentWidth)
							const id = c.id.split("-")[2]
							const video = document.getElementById(`v-${id}`)
							// console.log(video.videoWidth, video.videoHeight, " - ", id, " C ", video.clientHeight, " - W : ", video.clientWidth)
							const ratio = video.videoWidth / video.videoHeight
							let adjustedWidth = ratio * video.clientHeight
							if (video.clientWidth > adjustedWidth) {
								c.style.width = `${adjustedWidth}px`
							} else {
								adjustedWidth = video.clientWidth
								c.style.width = `${adjustedWidth}px`
							}
						}
					})
				})
			})
		} catch (error) {
			console.log("- Error Adjusting FR : ", error)
		}
	}

	async startSpeechToText({ socket, status }) {
		try {
			if (!status) {
				if (this.#speechToText.recognition) {
					this.#speechToText.recognition.abort()
				}
				this.#speechToText.recognition = null
				this.#speechToText.speechRecognitionList = null
				return
			}

			if (this.#speechToText.recognition) {
				return
			}

			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
			const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
			this.#speechToText.recognition = new SpeechRecognition()
			this.#speechToText.speechRecognitionList = new SpeechGrammarList()
			this.#speechToText.recognition.continuous = true
			this.#speechToText.recognition.lang = "id-ID"
			this.#speechToText.recognition.interimResults = true
			this.#speechToText.recognition.maxAlternatives = 1

			const ccDisplay = document.getElementById("cc-container")
			let randomId = await this.constructor.generateRandomId(12)

			this.#speechToText.recognition.onresult = (event) => {
				let interimResults = ""
				const ccMessageSpan = document.getElementById(`cc_message_${randomId}`) || document.createElement("span")
				ccMessageSpan.id = `cc_message_${randomId}`

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript
					if (event.results[i].isFinal) {
						this.#speechToText.word.push(transcript.trim())
						if (ccDisplay.lastChild.id !== `cc_${randomId}`) {
							randomId = this.constructor.generateRandomId(12)
						}
					} else {
						interimResults += transcript
						ccMessageSpan.textContent = this.#speechToText.word.join(" ") + " " + interimResults
					}
					this.#allUsers.forEach((u) => {
						socket.emit("transcribe", {
							to: u.socketId,
							picture: this.#picture,
							username: this.#username,
							randomId,
							message: this.#speechToText.word.join(" ") + " " + interimResults,
						})
					})
				}
				ccDisplay.scrollTop = ccDisplay.scrollHeight
			}

			this.#speechToText.recognition.onerror = (event) => {
				if (event.error === "network" || event.error === "no-speech") {
					if (this.#speechToText.recognition) {
						setTimeout(() => {
							if (!this.#speechToText.recognition.running) {
								this.#speechToText.recognition.start()
							}
						}, 1000)
					}
				}
			}

			this.#speechToText.recognition.onend = () => {
				setTimeout(() => {
					if (this.#speechToText.recognition && !this.#speechToText.recognition.running) {
						this.#speechToText.recognition.start()
					}
				}, 1000)
			}

			await this.#speechToText.recognition.start()
		} catch (error) {
			// console.error("- Error Start Speech Recognition: ", error)
		}
	}

	// Resend is for applying to everyone chat on other user
	async sendChat({ socket, message, type, chatTo, fileDetail = null, resend = false }) {
		try {
			const targets =
				chatTo == "everyone" ? this.#allUsers.filter((user) => user.userId != this.#userId) : this.#allUsers.filter((user) => user.userId == chatTo)

			if (resend) {
				for (const user of targets) {
					const randomId = await this.constructor.generateRandomId(20, "-", 3)
					socket.emit("message", {
						userId: user.userId,
						to: user.socketId,
						message: { ...message },
						username: this.#username,
						picture: this.#picture,
						type,
						id: randomId,
						chatTo: "everyone",
						resend
					})
					if (type != "message" && fileDetail) {
						socket.emit("message-donwload-link", {
							userId: user.userId,
							to: user.socketId,
							id: randomId,
							api: fileDetail.api,
							status: fileDetail.status,
							type,
						})
					}
				}
				return
			}

			for (const user of targets) {
				const randomId = await this.constructor.generateRandomId(20, "-", 3)

				socket.emit("message", {
					userId: user.userId,
					to: user.socketId,
					message: { ...message },
					username: this.#username,
					picture: this.#picture,
					type,
					id: randomId,
					chatTo: chatTo == "everyone" ? chatTo : this.#userId,
				})

				if (type != "message" && fileDetail) {
					socket.emit("message-donwload-link", {
						userId: user.userId,
						to: user.socketId,
						id: randomId,
						api: fileDetail.api,
						status: fileDetail.status,
						type,
					})
				}
			}
		} catch (error) {
			console.log("- Error Send Chat Via Socket : ", error)
		}
	}
}

module.exports = { Users }
