const path = require("path");

// load env config
const localConfig = require('dotenv').config({ path : ".env" });

if (localConfig.error) {
	console.error("error occured please specify the environment config");
	throw localConfig.error;
}

// use absolute path if needed
const rootPath = "../";

// if you needed secret config variables (credentials, apiKeys, tokens) put them in env variables as stated in 
// const someConfig = localConfig["secret"];

module.exports = {
	rootPath,
	// someConfig
};