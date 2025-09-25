class EventListener {
	#roomId
	// Block
	#blockContainer
	#blockStatus

	// Microphone
	#microphoneButton
	#microphoneStatus
	#microphoneDevicesOption
	#microphoneOptions

	// Camera
	#cameraButton
	#cameraStatus
	#cameraDevicesOption
	#cameraOptions

	// User List
	#userListButton
	#userListStatus

	// Chat
	#chatButton
	#chatStatus

	// Raise Hand
	#raiseHandButton
	#raiseHandStatus

	// CC
	#ccButton
	#ccStatus
	#ccContainer

	// Option
	#optionButton
	#optionStatus
	#optionContainer

	// Mute All
	#muteAllButton
	#muteAllStatus

	// Video Container
	#videoContainer
	#videoContainerNormalView = "video-container-normal-view"
	#videoContainerSideBarView = "video-container-side-bar-view"

	// Side Bar Container
	#sideBarContainer
	#sideBarStatus
	#sideBarDisplay = "side-bar-container"
	#sideBarHide = "side-bar-container-hide"
	#chatContainer
	#userListContainer
	// #usersListContainer
	#userListWaitingContainer
	#userListWaiting

	// #waitingNotificationListContainer
	#waitingNotificationListUserContainer

	// #raiseHandListCOntainer
	#raiseHandListContainer
	#raiseHandList
	#raiseHandNotificationContainer

	// Modal Video Container
	#modalVideoLayoutButton
	#modalVideoLayoutContainer
	#modalVideoLayoutClose
	#modalVideoLayoutStatus
	#layoutVideoOptions
	#layoutVideo
	#layoutCountContainer
	#layoutCount
	#alertVideoLayout

	#videoQualityContainer
	#upstreamOptionContainer
	#upstreamSelected
	#downstreamOptionContainer
	#downstreamSelected

	// Record
	#recordStatus
	#recordContainer
	#recordButton
	#timerSpan
	#timerCounter
	#timerFunction
	#pauseRecordButton
	#resumeRecordButton
	#startTime
	#elapsedTime
	#timerTitle

	constructor({ micStatus = true, cameraStatus = true, roomId = "" }) {
		this.#roomId = roomId
		// Block
		this.#blockContainer = document.getElementById("block-container")
		this.#blockStatus = false

		// Microphone
		this.#microphoneButton = document.getElementById("mic-icon")
		this.#microphoneStatus = micStatus
		this.#microphoneDevicesOption = document.getElementById("microphone-devices-option")
		this.#microphoneOptions = document.getElementById("mic-options")

		// Camera
		this.#cameraButton = document.getElementById("camera-icon")
		this.#cameraStatus = cameraStatus
		this.#cameraDevicesOption = document.getElementById("camera-devices-option")
		this.#cameraOptions = document.getElementById("video-options")

		// User List
		this.#userListButton = document.getElementById("user-list-button")
		this.#userListStatus = false

		// User List
		this.#chatButton = document.getElementById("chat-button")
		this.#chatStatus = false

		// Raise Hand
		this.#raiseHandButton = document.getElementById("raise-hand-button")
		this.#raiseHandStatus = false
		this.#raiseHandNotificationContainer = document.getElementById("raise-hand-notification")

		// CC
		this.#ccButton = document.getElementById("cc-button")
		this.#ccContainer = document.getElementById("cc-container")
		this.#ccStatus = false

		// Option
		this.#optionButton = document.getElementById("option-button")
		this.#optionStatus = false
		this.#optionContainer = document.getElementById("option-container")

		// Video Container
		this.#videoContainer = document.getElementById("video-container")

		// Side Bar Container
		this.#sideBarContainer = document.getElementById("side-bar-container")
		this.#sideBarStatus = false
		this.#chatContainer = document.getElementById("chat-container")
		this.#userListContainer = document.getElementById("user-list-container")
		// this.#usersListContainer = document.getElementById("users-list-container")
		this.#userListWaitingContainer = document.getElementById("waiting-list-container")
		this.#userListWaiting = document.getElementById("waiting-list-users")
		this.#raiseHandListContainer = document.getElementById("raise-hand-list-container")
		this.#raiseHandList = document.getElementById("raise-hand-list")
		this.#waitingNotificationListUserContainer = document.getElementById("waiting-notification")

		// Mute All
		this.#muteAllButton = document.getElementById("mute-all-button")
		this.#muteAllStatus = false

		// Modal Video Container
		this.#modalVideoLayoutButton = document.getElementById("video-layout-button")
		this.#modalVideoLayoutContainer = document.getElementById("layout-modal")
		this.#modalVideoLayoutClose = document.getElementById("close-button-layout")
		this.#layoutVideoOptions = document.querySelectorAll(".layout-option-container")
		this.#layoutCountContainer = document.querySelectorAll(".layout-option")
		this.#layoutVideo = "1"
		this.#layoutCount = "6"
		this.#alertVideoLayout = document.getElementById("alert-video-layout")
		this.#videoQualityContainer = document.getElementById("video-quality-container")
		this.#upstreamOptionContainer = document.querySelectorAll(".upstream-option")
		this.#downstreamOptionContainer = document.querySelectorAll(".downstream-option")

		// Record
		this.#recordStatus = false
		this.#recordContainer = document.getElementById("record-container")
		this.#recordButton = document.getElementById("record-button")
		this.#timerSpan = document.getElementById("timer-span")
		this.#timerCounter = "00:00:00"
		this.#pauseRecordButton = document.getElementById("pause-record")
		this.#resumeRecordButton = document.getElementById("resume-record")
		this.#elapsedTime = 0
		this.#timerTitle = document.getElementById("timer-title")
	}

	get chatStatus() {
		return this.#chatStatus
	}

	set chatStatus(status) {
		this.#chatStatus = status
	}

	get chatButton() {
		return this.#chatButton
	}

	set chatButton(newChatButton) {
		this.#chatButton = newChatButton
	}

	get userListButton() {
		return this.#userListButton
	}

	set userListButton(newUserList) {
		this.#userListButton = newUserList
	}

	get microphoneStatus() {
		return this.#microphoneStatus
	}

	get roomId() {
		return this.#roomId
	}

	async changeMicButton({ id }) {
		try {
			const myUserLicMic = document.getElementById(`mic-ul-${id}`)
			if (this.#microphoneStatus) {
				myUserLicMic.src = `${baseUrl}/assets/icons/user_list_mic.svg`
				this.#microphoneButton.src = `${baseUrl}/assets/icons/mic_muted.svg`
			} else {
				myUserLicMic.src = `${baseUrl}/assets/icons/user_list_mic_active.svg`
				this.#microphoneButton.src = `${baseUrl}/assets/icons/mic.svg`
			}
			this.#microphoneStatus = !this.#microphoneStatus
		} catch (error) {
			console.log("- Error Change Mic Button : ", error)
		}
	}

	async changeCameraButton() {
		try {
			if (this.#cameraStatus) {
				this.#cameraButton.src = `${baseUrl}/assets/icons/camera_off.svg`
			} else {
				this.#cameraButton.src = `${baseUrl}/assets/icons/camera.svg`
			}
			this.#cameraStatus = !this.#cameraStatus
		} catch (error) {
			console.log("- Error Change Camera Button : ", error)
		}
	}

	async changeUserListButton() {
		try {
			this.disablingButton({ element: this.#chatButton })
			this.disablingButton({ element: this.#userListButton })
			this.#userListButton = document.getElementById("user-list-button")
			this.#chatButton = document.getElementById("chat-button")
			if (this.#chatStatus && !this.#userListStatus) {
				this.hideAndDisplay({ element: this.#chatContainer, status: false })
				this.changeChatButton()
			}
			if (this.#userListStatus) {
				this.#userListButton.firstElementChild.src = `${baseUrl}/assets/icons/people.svg`
				this.#userListButton.classList.remove("active")
				this.#sideBarStatus = false
				this.hideAndDisplay({ element: this.#userListContainer, status: false })
			} else {
				this.#userListButton.firstElementChild.src = `${baseUrl}/assets/icons/people_active.svg`
				this.#userListButton.classList.add("active")
				this.#sideBarStatus = true
				this.hideAndDisplay({ element: this.#userListContainer, status: true })
			}

			await this.changeSideBarContainer()
			this.#userListStatus = !this.#userListStatus
		} catch (error) {
			console.log("- Error Change User List Button : ", error)
			alert(error)
		}
	}

	async changeChatButton() {
		try {
			let chatTo = "everyone"
			this.disablingButton({ element: this.#userListButton })
			this.disablingButton({ element: this.#chatButton })
			this.#chatButton = document.getElementById("chat-button")
			this.#userListButton = document.getElementById("user-list-button")
			if (this.#userListStatus && !this.#chatStatus) {
				this.hideAndDisplay({ element: this.#userListContainer, status: false })
				this.changeUserListButton()
			}
			if (this.#chatStatus) {
				this.#chatButton.firstElementChild.src = `${baseUrl}/assets/icons/chat.svg`
				this.#chatButton.classList.remove("active")
				this.#sideBarStatus = false
				this.hideAndDisplay({ element: this.#chatContainer, status: false })
				const newMessageLine = document.getElementById("new-message-line")
				if (newMessageLine) {
					newMessageLine.remove()
				}
			} else {
				this.#chatButton.firstElementChild.src = `${baseUrl}/assets/icons/chat_active.svg`
				this.#chatButton.classList.add("active")
				this.#sideBarStatus = true
				this.hideAndDisplay({ element: this.#chatContainer, status: true })
				let chatContent = document.getElementById(`chat-${chatTo}`)
				chatContent.scrollTop = chatContent.scrollHeight
				const redDotCHat = document.getElementById("red-dot-chat")
				if (!redDotCHat.classList.contains("d-none")) {
					redDotCHat.classList.add("d-none")
				}
			}
			await this.changeSideBarContainer()
			this.#chatStatus = !this.#chatStatus
		} catch (error) {
			console.log("- Error Change Chat Button : ", error)
		}
	}

	async changeChatButtonMobile() {
		try {
			let chatTo = "everyone"
			if (this.#userListStatus && !this.#chatStatus) {
				this.hideAndDisplay({ element: this.#userListContainer, status: false })
				this.changeUserListButton()
			}
			this.#chatButton = document.getElementById("chat-button")
			if (this.#chatStatus) {
				this.#chatButton.firstElementChild.src = `${baseUrl}/assets/icons/chat.svg`
				this.#chatButton.classList.remove("active")
				this.#sideBarStatus = false
				this.hideAndDisplay({ element: this.#chatContainer, status: false })
				const newMessageLine = document.getElementById("new-message-line")
				if (newMessageLine) {
					newMessageLine.remove()
				}
			} else {
				this.#chatButton.firstElementChild.src = `${baseUrl}/assets/icons/chat_active.svg`
				this.#chatButton.classList.add("active")
				this.#sideBarStatus = true
				this.hideAndDisplay({ element: this.#chatContainer, status: true })
				let chatContent = document.getElementById(`chat-${chatTo}`)
				chatContent.scrollTop = chatContent.scrollHeight
				const redDotCHat = document.getElementById("red-dot-chat")
				if (!redDotCHat.classList.contains("d-none")) {
					redDotCHat.classList.add("d-none")
				}
			}
			await this.changeSideBarContainer()
			this.#chatStatus = !this.#chatStatus
		} catch (error) {
			console.log("- Error Change Chat Button : ", error)
			alert(error)
		}
	}

	async changeRaiseHandButton() {
		try {
			if (this.#raiseHandStatus) {
				this.#raiseHandButton.firstElementChild.src = `${baseUrl}/assets/icons/raise_hand.svg`
				this.#raiseHandButton.classList.remove("active")
				if (document.getElementById("raise-hand-mobile")) {
					document.getElementById("raise-hand-mobile").src = `${baseUrl}/assets/icons/raise_hand.svg`
				}
			} else {
				this.#raiseHandButton.firstElementChild.src = `${baseUrl}/assets/icons/raise_hand_active.svg`
				this.#raiseHandButton.classList.add("active")
				if (document.getElementById("raise-hand-mobile")) {
					document.getElementById("raise-hand-mobile").src = `${baseUrl}/assets/icons/raise_hand_active.svg`
				}
			}
			this.#raiseHandStatus = !this.#raiseHandStatus
			return this.#raiseHandStatus
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeCCButton() {
		try {
			if (this.#ccStatus) {
				this.#ccButton.firstElementChild.src = `${baseUrl}/assets/icons/cc.svg`
				this.#ccButton.classList.remove("active")
				if (document.getElementById("cc-mobile")) {
					document.getElementById("cc-mobile").src = `${baseUrl}/assets/icons/cc.svg`
				}
			} else {
				if (document.getElementById("cc-mobile")) {
					document.getElementById("cc-mobile").src = `${baseUrl}/assets/icons/cc_active_2.svg`
				}
				this.#ccButton.firstElementChild.src = `${baseUrl}/assets/icons/cc_active.svg`
				this.#ccButton.classList.add("active")
			}
			this.#ccStatus = !this.#ccStatus
			await this.normalHideAndDisplay({ element: this.#ccContainer, status: this.#ccStatus })
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeOptionButton() {
		try {
			if (this.#optionStatus) {
				this.#optionButton.classList.remove("active")
			} else {
				this.#optionButton.classList.add("active")
			}
			this.#optionStatus = !this.#optionStatus
			// await this.normalHideAndDisplay({ element: this.#optionContainer, status: this.#optionStatus })
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async changeMuteAllButton() {
		try {
			if (this.#muteAllStatus) {
				this.#muteAllButton.classList.remove("active")
			} else {
				this.#muteAllButton.classList.add("active")
			}
			this.#muteAllStatus = !this.#muteAllStatus
			return this.#muteAllStatus
		} catch (error) {
			console.log("- Error Change Raise Hand Button : ", error)
		}
	}

	async hideUserOptionButton() {
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
			if (!this.#cameraOptions.classList.contains("d-none")) {
				this.#cameraOptions.classList.add("d-none")
			}
			if (!this.#microphoneOptions.classList.contains("d-none")) {
				this.#microphoneOptions.classList.add("d-none")
			}
		} catch (error) {
			console.log("- Error Hide User Option Button : ", error)
		}
	}

	async changeSideBarContainer() {
		try {
			if (this.#sideBarStatus) {
				this.#videoContainer.className = this.#videoContainerSideBarView
				this.#sideBarContainer.classList.remove(this.#sideBarHide)
			} else {
				this.#videoContainer.className = this.#videoContainerNormalView
				this.#sideBarContainer.classList.add(this.#sideBarHide)
			}
		} catch (error) {
			console.log("- Error Change Side Bar Containe : ", error)
		}
	}

	async closeSideBarContainer() {
		try {
			// this.#videoContainer.className = this.#videoContainerNormalView
			// this.#sideBarContainer.classList.add(this.#sideBarHide)
			// this.#chatStatus = false
			// this.#userListStatus = false
			// this.#chatButton.classList.remove("active")
			// this.#userListButton.classList.remove("active")
			// this.#chatButton.firstElementChild.src = "/assets/icons/chat.svg"
			await this.changeChatButton()
		} catch (error) {
			console.log("- Error Close Side Bar : ", error)
		}
	}

	async hideAndDisplay({ element, status }) {
		try {
			if (status) {
				element.classList.remove("d-none")
			} else {
				if (!element.classList.contains("d-none")) {
					if (this.#sideBarStatus && (this.#chatStatus || this.#userListStatus)) {
						element.classList.add("d-none")
						return
					}
					setTimeout(() => {
						if (!this.#sideBarStatus && !this.#chatStatus && !this.#userListStatus) {
							element.classList.add("d-none")
						}
					}, 1000)
				}
			}
		} catch (error) {
			console.log("- Error Hiding/Display Element : ", error)
		}
	}

	async normalHideAndDisplay({ element, status }) {
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

	async disablingButton({ element }) {
		try {
			element.setAttribute("disabled", true)
			setTimeout(() => {
				element.removeAttribute("disabled")
			}, 1100)
		} catch (error) {
			console.log("- Error Disabling Button : ", error)
		}
	}

	async hideButton() {
		try {
			if (!this.#optionContainer.classList.contains("d-none")) {
				if (this.#optionStatus) {
					this.changeOptionButton()
				}
			}
		} catch (error) {
			console.log("- Error Hiding Menu : ", error)
		}
	}

	async microphoneDevicesOption() {
		try {
			if (this.#microphoneOptions.classList.contains("d-none")) {
				this.#microphoneOptions.classList.remove("d-none")
			} else {
				this.#microphoneOptions.classList.add("d-none")
			}
		} catch (error) {
			console.log("- Error Hide or Display Option : ", error)
		}
	}

	async cameraDevicesOption() {
		try {
			if (this.#cameraOptions.classList.contains("d-none")) {
				this.#cameraOptions.classList.remove("d-none")
			} else {
				this.#cameraOptions.classList.add("d-none")
			}
		} catch (error) {
			console.log("- Error Hide or Display Option : ", error)
		}
	}

	async changeVideoLayout() {
		try {
			if (this.#modalVideoLayoutStatus) {
				this.#modalVideoLayoutContainer.classList.remove("layout-modal-show")
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: false })
				this.#blockStatus = false
			} else {
				this.#modalVideoLayoutContainer.classList.add("layout-modal-show")
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: true })
				this.#blockStatus = true
			}
			this.#modalVideoLayoutStatus = !this.#modalVideoLayoutStatus
		} catch (error) {
			console.log("- Error Show Video Layout Class : ", error)
		}
	}

	async closeVideoLayout() {
		try {
			this.#modalVideoLayoutContainer.classList.remove("layout-modal-show")
			await this.normalHideAndDisplay({ element: this.#blockContainer, status: false })
			this.#blockStatus = false
			this.#modalVideoLayoutStatus = false
		} catch (error) {
			console.log("- Error Show Video Layout Class : ", error)
		}
	}

	async openVideoQualityContainer() {
		try {
			if (this.#videoQualityContainer.style.top == "50%") {
				this.#videoQualityContainer.style.top = "-50%"
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: false })
				this.#blockStatus = false
			} else {
				await this.normalHideAndDisplay({ element: this.#blockContainer, status: true })
				this.#blockStatus = true
				this.#videoQualityContainer.style.top = "50%"
			}
		} catch (error) {
			console.log("- Error Open Video Quality Container : ", error)
		}
	}

	async closeVideoQualityContainer() {
		try {
			this.#videoQualityContainer.style.top = "-50%"
			await this.normalHideAndDisplay({ element: this.#blockContainer, status: false })
			this.#blockStatus = false
		} catch (error) {
			console.log("- Error Open Video Quality Container : ", error)
		}
	}

	async selectUpstream({ container }) {
		try {
			for (const c of this.#upstreamOptionContainer) {
				const radio = c.querySelector(".mini-radio")
				if (c === container) {
					radio.src = `${baseUrl}/assets/icons/mini_radio_active.svg`
					this.#upstreamSelected = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/mini_radio.svg`
				}
			}
			return this.#upstreamSelected
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async selectDownstream({ container }) {
		try {
			for (const c of this.#downstreamOptionContainer) {
				const radio = c.querySelector(".mini-radio")
				if (c === container) {
					radio.src = `${baseUrl}/assets/icons/mini_radio_active.svg`
					this.#downstreamSelected = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/mini_radio.svg`
				}
			}
			return this.#downstreamSelected
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async selectVideoLayout({ container }) {
		try {
			this.#layoutVideoOptions.forEach((c) => {
				const radio = c.querySelector(".radio")
				if (c === container) {
					radio.src = `${baseUrl}/assets/icons/radio_button_active.svg`
					this.#upstreamSelected = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/radio_button.svg`
				}
			})
			await this.statusLayoutCount()
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async selectLayoutCount({ container }) {
		try {
			if (this.#layoutVideo != 1) {
				return
			}
			this.#layoutCountContainer.forEach((c) => {
				const radio = c.querySelector(".mini-radio")
				if (c === container) {
					radio.src = `${baseUrl}/assets/icons/mini_radio_active.svg`
					this.#layoutCount = c.dataset.option
				} else {
					radio.src = `${baseUrl}/assets/icons/mini_radio.svg`
				}
			})
		} catch (error) {
			console.log("- Error Select Video Layout : ", error)
		}
	}

	async statusLayoutCount() {
		try {
			if (this.#layoutVideo == "1") {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.remove("custom-disable")
						container.removeAttribute("pointer-events")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				this.#alertVideoLayout.classList.add("hide-alert")
			} else {
				this.#layoutCountContainer.forEach((container) => {
					try {
						container.classList.add("custom-disable")
						container.setAttribute("pointer-events", "none")
					} catch (error) {
						console.log("- Error Disabling Layout Count : ", error)
					}
				})
				this.#alertVideoLayout.classList.remove("hide-alert")
			}
		} catch (error) {
			console.log("- Error Status Layout Count : ", error)
		}
	}

	async recordMeeting({ from }) {
		try {
			if (!from && this.#recordStatus) {
				return
			}
			if (this.#recordStatus) {
				await this.normalHideAndDisplay({ element: this.#recordContainer, status: false })
				this.#recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record.svg`
				this.#recordButton.lastElementChild.innerHTML = "Mulai Merekam"
				this.#recordButton.removeAttribute("pointer-events")
			} else {
				await this.normalHideAndDisplay({ element: this.#recordContainer, status: true })
				this.#recordButton.firstElementChild.src = `${baseUrl}/assets/icons/record_active.svg`
				this.#recordButton.lastElementChild.innerHTML = "Berhenti Merekam"
				this.#recordButton.setAttribute("pointer-events", "none")
			}
			this.#recordStatus = !this.#recordStatus
			await this.timer()
		} catch (error) {
			console.log("- Error Record Meeting : ", error)
		}
	}

	async timer() {
		try {
			if (!this.#elapsedTime) {
				this.#elapsedTime = 0
			}
			if (this.#recordStatus) {
				this.#startTime = Date.now() - this.#elapsedTime // Adjust startTime by the elapsed time

				this.#timerFunction = setInterval(() => {
					let currentTime = Date.now()
					this.#elapsedTime = currentTime - this.#startTime // Update elapsed time
					let hours = Math.floor(this.#elapsedTime / 3600000)
					let minutes = Math.floor((this.#elapsedTime % 3600000) / 60000)
					let seconds = Math.floor((this.#elapsedTime % 60000) / 1000)

					this.#timerCounter = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds

					this.#timerSpan.innerHTML = this.#timerCounter
				}, 1000)
			} else {
				this.#elapsedTime = undefined
				clearInterval(this.#timerFunction)
				this.#timerTitle.innerHTML = "Merekam :"
				// await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: false })
				// await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: true })
				this.#timerCounter = "00:00:00"
				this.#timerSpan.innerHTML = this.#timerCounter
			}
		} catch (error) {
			console.log("- Error Start Timer : ", error)
		}
	}

	async pauseRecord() {
		try {
			clearInterval(this.#timerFunction)
			this.#timerTitle.innerHTML = "Dijeda :"
			// await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: false })
			// await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: true })
		} catch (error) {
			console.log("- Error Pause Timer : ", error)
		}
	}

	async resumeRecord() {
		try {
			if (this.#recordStatus) {
				this.#timerTitle.innerHTML = "Merekam :"
				this.timer()
				// await this.normalHideAndDisplay({ element: this.#pauseRecordButton, status: true })
				// await this.normalHideAndDisplay({ element: this.#resumeRecordButton, status: false })
			}
		} catch (error) {
			console.log("- Error Resume Timer : ", error)
		}
	}

	async waitingUserHover({ element, picture }) {
		try {
			element.src = picture
		} catch (error) {
			console.log("- Error Waiting User Hover: ", error)
		}
	}

	async getInitialsAndColor(name) {
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

	// Method Join
	async methodAddWaitingUser({ id, username, socket, picture }) {
		try {
			const redDotUserList = document.getElementById("red-dot-user-list")
			const alphabetUsername = await this.getInitialsAndColor(username)

			redDotUserList.classList.remove("d-none")
			let userWaitingListElement = document.createElement("div")
			userWaitingListElement.className = "user-list-content"
			userWaitingListElement.id = `wait-${id}`
			userWaitingListElement.innerHTML = `
									<div class="user-list-profile">
										<span id="color-wait-${id}" style="color: ${alphabetUsername.color};" class="user-list-picture">${alphabetUsername.initials}</span>
										<span class="user-list-username">${username}</span>
									</div>
									<div class="user-list-icons">
										<img style="cursor: pointer;" src="${baseUrl}/assets/icons/accept.svg"
											alt="user-list-icon" class="user-list-icon" id="accept-${id}" />
										<img style="cursor: pointer;" src="${baseUrl}/assets/icons/reject.svg" alt="user-list-icon" class="user-list-icon" 
										id="reject-${id}" />
									</div>
								`

			let userWaitingNotificationListElement = document.createElement("div")
			userWaitingNotificationListElement.className = `waiting-notification-list`
			userWaitingNotificationListElement.id = `waiting-notification-list-${id}`
			userWaitingNotificationListElement.innerHTML = `
					<span>${username}</span>
					<div class="waiting-notification-list-icons" id="waiting-notification-list-icons">
                        <img style="cursor: pointer;" src="${baseUrl}/assets/icons/accept.svg" alt="user-list-icon"
                            class="user-list-icon" id="waiting-list-notification-accept-${id}" />
                        <img style="cursor: pointer;" src="${baseUrl}/assets/icons/reject.svg" alt="user-list-icon"
                            class="user-list-icon" id="waiting-list-notification-reject-${id}" />
                    </div>
			`

			this.#userListWaiting.appendChild(userWaitingListElement)
			this.#waitingNotificationListUserContainer.appendChild(userWaitingNotificationListElement)

			const currentUserWaitingAcceptElement = document.getElementById(`accept-${id}`)
			const handleMouseOver = (event) => {
				try {
					event.target.src = event.target.src.replace(".svg", "_active.svg")
				} catch (error) {
					console.log("- Error Mouse Over:", error)
				}
			}

			const handleMouseLeave = (event) => {
				try {
					event.target.src = event.target.src.replace("_active.svg", ".svg")
				} catch (error) {
					console.log("- Error Mouse Leave:", error)
				}
			}

			const acceptEvent = () => {
				try {
					socket.emit("response-member-waiting", { response: true, id: id, roomId: this.#roomId })
					socket.emit("admin-response", { type: "waiting-list", id, roomId: this.#roomId })
					removeEventListener()
					this.checkWaitingList()
				} catch (error) {
					console.log("- Error Accept Waiting User : ", error)
				}
			}

			const rejectEvent = () => {
				try {
					socket.emit("response-member-waiting", { response: false, id: id, roomId: this.#roomId })
					socket.emit("admin-response", { type: "waiting-list", id, roomId: this.#roomId })
					removeEventListener()
					this.checkWaitingList()
				} catch (error) {
					console.log("- Error Accept Waiting User : ", error)
				}
			}

			currentUserWaitingAcceptElement.addEventListener("mouseover", handleMouseOver)
			currentUserWaitingAcceptElement.addEventListener("mouseleave", handleMouseLeave)
			const currentUserWaitingRejectElement = document.getElementById(`reject-${id}`)
			currentUserWaitingRejectElement.addEventListener("mouseover", handleMouseOver)
			currentUserWaitingRejectElement.addEventListener("mouseleave", handleMouseLeave)

			currentUserWaitingAcceptElement.addEventListener("click", acceptEvent)

			currentUserWaitingRejectElement.addEventListener("click", rejectEvent)

			const currentUserWaitingNotificationAcceptElement = document.getElementById(`waiting-list-notification-accept-${id}`)
			const currentUserWaitingNotificationRejectElement = document.getElementById(`waiting-list-notification-reject-${id}`)

			currentUserWaitingNotificationAcceptElement.addEventListener("mouseover", handleMouseOver)
			currentUserWaitingNotificationAcceptElement.addEventListener("mouseleave", handleMouseLeave)

			currentUserWaitingNotificationRejectElement.addEventListener("mouseover", handleMouseOver)
			currentUserWaitingNotificationRejectElement.addEventListener("mouseleave", handleMouseLeave)

			currentUserWaitingNotificationAcceptElement.addEventListener("click", acceptEvent)
			currentUserWaitingNotificationRejectElement.addEventListener("click", rejectEvent)

			const removeEventListener = () => {
				try {
					currentUserWaitingAcceptElement.removeEventListener("mouseover", handleMouseOver)
					currentUserWaitingAcceptElement.removeEventListener("mouseleave", handleMouseLeave)
					currentUserWaitingRejectElement.removeEventListener("mouseover", handleMouseOver)
					currentUserWaitingRejectElement.removeEventListener("mouseleave", handleMouseLeave)
					currentUserWaitingNotificationAcceptElement.removeEventListener("mouseover", handleMouseOver)
					currentUserWaitingNotificationAcceptElement.removeEventListener("mouseleave", handleMouseLeave)
					currentUserWaitingNotificationRejectElement.removeEventListener("mouseover", handleMouseOver)
					currentUserWaitingNotificationRejectElement.removeEventListener("mouseleave", handleMouseLeave)
					currentUserWaitingAcceptElement.removeEventListener("click", acceptEvent)
					currentUserWaitingRejectElement.removeEventListener("click", rejectEvent)
					currentUserWaitingNotificationAcceptElement.removeEventListener("click", acceptEvent)
					currentUserWaitingNotificationRejectElement.removeEventListener("click", rejectEvent)
					userWaitingListElement.remove()
					userWaitingNotificationListElement.remove()
				} catch (error) {
					console.log("- Error Remove Listener : ", error)
				}
			}

			await this.checkWaitingList()
		} catch (error) {
			console.log("- Error Add Waiting List User : ", error)
		}
	}

	async methodAddRaiseHandUser({ id, username = "Tidak Diketahui", picture = "P_0000000", status }) {
		try {
			if (status) {
				if (!document.getElementById(`raise-${id}`)) {
					let raiseHandElement = document.createElement("div")
					raiseHandElement.className = "user-list-content"
					raiseHandElement.id = `raise-${id}`
					raiseHandElement.innerHTML = `
											<div class="user-list-profile">
												<img src="${baseUrl}/photo/${picture}.png" alt="user-list-picture"
													class="user-list-picture" />
												<span class="user-list-username">${username}</span>
											</div>
											<div class="user-list-icons">
												<img src="${baseUrl}/assets/icons/raise_hand_list.svg"
													alt="user-list-icon" class="user-list-icon" id="raise-hand-${id}" />
											</div>
										`
					this.#raiseHandList.appendChild(raiseHandElement)
				}
			} else {
				if (document.getElementById(`raise-${id}`)) {
					document.getElementById(`raise-${id}`).remove()
				}
			}
			await this.checkRaiseHandList()
		} catch (error) {
			console.log("- Error Raise Hand User : ", error)
		}
	}

	async raiseHandNotification({ username }) {
		try {
			const raisedHandElement = document.createElement("div")
			raisedHandElement.className = "raised-hand"
			raisedHandElement.innerHTML = `
				<img src="${baseUrl}/assets/icons/raise_hand.svg" alt=""><span>${username}</span>
			`
			this.#raiseHandNotificationContainer.append(raisedHandElement)

			setTimeout(() => {
				raisedHandElement.remove()
			}, 3000)
		} catch (error) {
			console.log("- Error Notification Raise Hand : ", error)
		}
	}

	async removeWaitingList({ id }) {
		try {
			const waitedUser = document.getElementById(`wait-${id}`)
			const waitedNotification = document.getElementById(`waiting-notification-list-${id}`)

			if (waitedUser) {
				waitedUser.remove()
			}

			if (waitedNotification) {
				waitedNotification.remove()
			}

			await this.checkWaitingList()
		} catch (error) {
			console.log("- Error Remove Waiting List : ", error)
		}
	}

	async deleteWaitingUser({ id }) {
		try {
			const waitingUserList = document.getElementById(`wait-${id}`)
			if (waitingUserList) {
				await waitingUserList.remove()
			}

			await this.checkWaitingList()
		} catch (error) {
			console.log("- Error Delete Waiting User : ", error)
		}
	}

	async removeScreenSharingPermissionUser({ id }) {
		try {
			const screenSharingPermissionElement = document.getElementById(`screensharing-permission-${id}`)
			if (screenSharingPermissionElement) {
				screenSharingPermissionElement.remove()
			}
		} catch (error) {
			console.log("- Error Deleting Screen Sharing User : ", error)
		}
	}

	async newUserNotification({ username, picture }) {
		try {
			const newUserNotificationContainer = document.getElementById("new-user-join-notification-container")
			const newUserContainer = document.createElement("section")
			newUserContainer.className = "new-user-join"
			newUserContainer.innerHTML = `<img src="${
				picture ? `${baseUrl}/photo/${picture}.png` : `${baseUrl}/assets/pictures/default_user_pic.png`
			}" alt="new-user-join" class="new-user-profile-picture"><span class="notification-text">${username} join the room</span>`
			newUserNotificationContainer.appendChild(newUserContainer)
			setTimeout(() => {
				newUserContainer.remove()
			}, 3000)
		} catch (error) {
			console.log("- Error Displaying New User Joined The Room Notification : ", error)
		}
	}

	// Method Check
	async checkWaitingList() {
		try {
			this.#userListWaiting = document.getElementById("waiting-list-users")
			// Display
			if (this.#userListWaiting.firstElementChild) {
				await this.normalHideAndDisplay({ element: this.#userListWaitingContainer, status: true })
			} else {
				// Hide
				if (!this.#userListWaitingContainer.classList.contains("d-none")) {
					await this.normalHideAndDisplay({ element: this.#userListWaitingContainer, status: false })
				}
				const redDotUserList = document.getElementById("red-dot-user-list")
				if (!redDotUserList.classList.contains("d-none")) {
					redDotUserList.classList.add("d-none")
				}
			}
		} catch (error) {
			console.log("- Error Check Waiting List : ", error)
		}
	}

	async checkRaiseHandList() {
		try {
			this.#raiseHandList = document.getElementById("raise-hand-list")
			if (this.#raiseHandList.firstElementChild) {
				await this.normalHideAndDisplay({ element: this.#raiseHandListContainer, status: true })
			} else {
				if (!this.#raiseHandListContainer.classList.contains("d-none")) {
					await this.normalHideAndDisplay({ element: this.#raiseHandListContainer, status: false })
				}
			}
		} catch (error) {
			console.log("- Error Check Raise Hand : ", error)
		}
	}

	async resetChat() {
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

	async deleteUserList({ id }) {
		try {
			const userListElement = document.getElementById(`ul-${id}`)
			const chatToElement = document.getElementById(`chat-to-${id}`)
			const chatContainerElement = document.getElementById(`chat-${id}`)
			if (chatToElement) {
				if (chatToElement.classList.contains("selected")) {
					await this.resetChat()
				}
				chatToElement.remove()
			}

			if (chatContainerElement) {
				if (chatContainerElement.classList.contains("d-none")) {
					await this.resetChat()
				}
				chatContainerElement.remove()
			}

			if (userListElement) {
				userListElement.remove()
			}
		} catch (error) {
			console.log("- Error Delete User List : ", error)
		}
	}

	async messageTemplate({ isSender, username, messageDate, message, picture, type = "message", id, chatTo = "everyone", userId, resend = false }) {
		try {
			const chatContent = document.getElementById(`chat-${chatTo}`)
			const hasPreviousMessage = chatContent.children.length > 0

			const lastHeader = chatContent?.lastElementChild?.querySelector(".message-header")
			const usernameLastMessage = lastHeader?.querySelector("span:first-child")?.innerHTML
			const dateLastMessage = lastHeader?.querySelector("span:last-child")?.innerHTML

			const isGrouped = hasPreviousMessage && usernameLastMessage === username && dateLastMessage === messageDate

			const chatToElement = document.getElementById(`chat-${chatTo}`)
			const chatToUsername = chatToElement.dataset.username

			let contentHTML = ""
			switch (type) {
				case "file":
				case "audio":
					contentHTML = `
					<div class="message message-file" id="${id}" style="cursor: pointer;  ${isSender ? `background-color: #203348;` : ""}">
						<div class="file-icon">
							<img src="${baseUrl}/assets/icons/chat_file.svg" alt="file">
						</div>
						<div class="file-detail">
							<span>${message.fileName}</span>
							<span class="file-size">${message.fileSize}</span>
						</div>
					</div>
				`
					break
				case "image":
					contentHTML = `
					<div class="message message-image" id="${id}" style="cursor: pointer;  ${isSender ? `background-color: #203348;` : ""}">
						<img id="chat-image-${id}" src="${baseUrl}/assets/pictures/loading-file.gif" alt="image">
					</div>
				`
					break
				case "video":
					contentHTML = `
						<div class="message message-video" id="${id}">
							<video controls preload="metadata"
									style="max-width: 100%; border-radius: 8px;">
								<source src="" type="video/mp4">
								Your browser does not support the video tag.
							</video>
						</div>
					`
					break
				default:
					contentHTML = `
					<div class="message" ${isSender ? `style="color: #203348;"` : ""}>
						<span>${message.content}</span>
					</div>
				`
			}

			// Message header
			const language = localStorage.getItem("language") === "en"
			const meText = language ? "Me" : "Saya"
			const fromWord = language ? "From" : "Dari"
			const toWord = language ? "to" : "untuk"
			const everyoneText = language ? "Everyone" : "Semua"

			const fromLabel = isSender ? meText : username

			let toLabel
			if (chatTo === "everyone") {
				toLabel = everyoneText
			} else if (isSender) {
				const chatToEl = document.getElementById(`chat-${chatTo}`)
				toLabel = chatToEl?.dataset?.username || chatTo
			} else {
				toLabel = meText
			}
			if (resend) {
				toLabel = meText
			}

			const headerHTML = `
				<div class="message-header ${isGrouped ? "d-none" : ""}">
					<span>${fromWord} <span class="blue-color-span">${fromLabel}</span> ${toWord} <span class="blue-color-span">${toLabel}</span></span>
					<span>${messageDate}</span>
				</div>
			`

			// Return based on isSender layout
			if (isSender) {
				return `
				<div class="message-content">
					${headerHTML}
					<div class="user-message-container">
						${contentHTML}
					</div>
				</div>
				<div class="message-profile">
					<img class="message-profile-photo ${isGrouped ? "d-none" : ""}"
						src="${baseUrl}/photo/${picture}.png" alt="profile-picture" />
				</div>
			`
			} else {
				return `
				<div class="message-profile">
					<img class="message-profile-photo ${isGrouped ? "d-none" : ""}"
						src="${baseUrl}/photo/${picture}.png" alt="profile-picture" />
				</div>
				<div class="message-content">
					${headerHTML}
					<div class="user-message-container">
						${contentHTML}
					</div>
				</div>
			`
			}
		} catch (error) {
			console.log("- Error Getting Message Template : ", error)
		}
	}

	async appendMessage({ message, chatTo = "everyone" }) {
		try {
			const messageElement = document.createElement("div")
			messageElement.className = "message-container"
			messageElement.innerHTML = message
			document.getElementById(`chat-${chatTo}`).appendChild(messageElement)
		} catch (error) {
			console.log("- Error Append Message : ", error)
		}
	}

	async messageListEvent() {
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

	async donwloadFileMessage({ id, api, status = true, type = "file" }) {
		try {
			const element = document.getElementById(id)
			if (!element) throw { message: "Element is not found" }

			if (!status) {
				element.innerHTML = "Gagal Upload"
				throw { message: "Gagal upload file" }
			}

			if (type != "video") {
				element.addEventListener("click", () => {
					const link = document.createElement("a")
					link.href = `${api}?id=${encodeURIComponent(id)}`
					link.target = "_blank"
					link.download = ""
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)
				})
			}

			if (type == "image") {
				document.getElementById(`chat-image-${id}`).src = api
			}
			if (type == "video") {
				console.log("- Video Template : ", document.getElementById(id))
				const videoElement = document.getElementById(id).querySelector("video")
				const source = videoElement.querySelector("source")
				source.src = api
				videoElement.load()
			}
		} catch (error) {
			console.log("- Error Download : ", error)
		}
	}
}

module.exports = {
	EventListener,
}
