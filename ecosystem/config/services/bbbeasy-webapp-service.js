module.exports = {
	name: "bbbeasy-webapp-service",
	script: "serve",
	cwd: "../../bbbeasy-frontend",
	watch: false,
	// env variables if needed
	env: {
		NODE_ENV: "production",
		PM2_SERVE_PATH: "../../bbbeasy-frontend/build/webapp",
		PM2_SERVE_PORT: 3300,
		PM2_SERVE_SPA: 'true',
		PM2_SERVE_HOMEPAGE: '/index.html'
	}
};
