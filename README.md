# siram

## Class Server

### Room

```js
class User {
	// Ini sudah di ruangan
	#users = [
		{
			id: "String",
			socketId: "String",
			room: "String",
			isAdmin: "Boolean",
		},
	]
}

class Room {
	// Ini masih di lobby
	#rooms = [
		{
			id: "String",
			members: [
				{
					id: "String",
					isAdmin: "Boolean",
				},
			],
		},
	]
	#waitingList = [
		{
			id: "String",
			roomId: "String",
		},
	]
}

class MediaSoup {
	#workers = [
		{
			worker: "Object",
			webrtcServer: "Object",
		},
	]
	#routers = [
		{
			router: "Object",
			roomId: "String",
		},
	]
	#transports = [
		{
			transport: "Object",
			routerId: "String",
			userId: "String",
			consumer: true || false,
			socketId: "String",
		},
	]
	#producers = [
		{
			producer: "Object",
			userId: "String",
			kind: "String",
			roomId: "String"
		},
	]
	#consumers = [
		{
			userId: "String",
			consumer: "Object",
		},
	]
}
```

## Class Client

### Room

```js
class MediaSoupClient {
	#mystream = "Object"
	#audioSetting = {
		autoGainControl: false,
		noiseSuppression: true,
		echoCancellation: true,
	}

	#rtpCapabilities = "Object"
	#device = "Object"
	#videoParams = {
		codec: "Object",
		encodings: [
			{ scaleResolutionDownBy: 4, scalabilityMode: "L1T3", maxBitrate: 100000 },
			{ scaleResolutionDownBy: 2, scalabilityMode: "L1T3", maxBitrate: 300000 },
			{ scaleResolutionDownBy: 1, scalabilityMode: "L1T3", maxBitrate: 600000 },
		],
	}

	#producerTransport = "Object"
	#consumerTransport = "Object"
	#audioProducer = "Object"
	#videoProducer = "Object"
	#consumers = [
		{
			userId: "String",
			consumer: "Object",
		},
	]
}
```

```js
class Users {
	#users
	#videoContainer
	#allUsers = [
		{
			userId: "String",
			admin: "Boolean",
			socketId: "String",
		},
	]
	#currentLayout
	#currentVideoClass
	#previousVideoClass
	#userId
}
```

### Scenario Join Room

- HOME_VIEW -> If there is no user in the room, they will be admin. It will check CLASS_ROOM, if there is no one, it will be save the user in CLASS_ROOM_ROOMS, otherwise it will save the user in CLASS_ROOM_WAITING_LIST
- ROOM_VIEW -> It will check CLASS_ROOM_ROOMS, if the user is exist in the CLASS_ROOM_ROOMS or CLASS_ROOM_WAITING_LIST, it will compared with USER_ID in CLASS_ROOM_ROOMS or CLASS_ROOM_WAITING_LIST, if its valid, it will successfully join the room, then save the USER_ID in CLASS_USER_USERS, and if it is invalid it will go to HOME_VIEW
- DISCONNECTED -> If socket is disconnected, it will check in CLASS_USER_USERS and CLASS_ROOM_WAITING_LIST, if the USER_ID is exists in CLASS_USER_USERS, it will delete it in CLASS_USER_USERS and CLASS_ROOM_ROOMS, if it exist in CLASS_ROOM_WAITING_LIST, it will search the admin USER_ID to notify the admin (remove from waiting list) by searching admin SOCKET_ID and delete user from CLASS_ROOM_WAITING_LIST

### Data Insert Flow

- Admin (The first to join)
  -> HOME_VIEW -> CLASS_ROOM_ROOMS -> ROOM_VIEW -> CLASS_USER_USERS
- User
  -> HOME_VIEW -> CLASS_ROOM_WAITING_LIST -> ROOM_VIEW -> CLASS_ROOM_ROOMS -> CLASS_USER_USERS

### Note

- Insert user (not admin) to the CLASS_ROOM_ROOMS if successfully join the room
- Fix disconnect, check CLASS_ROOM_WAITING_LIST first, then CLASS_USER_USERS
