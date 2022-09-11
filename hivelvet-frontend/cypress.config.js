const { defineConfig } = require('cypress');
const { Pool } = require('pg');
require('dotenv').config();
module.exports = defineConfig({
    e2e: {
        baseUrl: "http://hivelvet.test:3300",
        setupNodeEvents(on, config) {
            require("@cypress/code-coverage/task")(on, config);
            on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));
            on("task", { database({ sql, values }) {
                const pool = new Pool({
                    user: "hivelvet",
                    host: "localhost",
                    database: "hivelvet",
                    password: "hivelvet",
                    port: 5432
                });
                try { return pool.query(sql, values) } catch (e) { }
            }});
            config.env = process.env;
            return config;
        }
    }
});
