module.exports = {
	apps: [
		{
			name: "siram_api",
			script: "app.js",
			env: {
				NODE_ENV: "development",
				JWT_SECRET: "ISULOSTNEMUCODSDRTP",
				EXPRESS_SESSION_SECRET: "ISULOSTNEMUCODSDRTPSESSIONDASHBOARD",
			},
		},
	],
}
