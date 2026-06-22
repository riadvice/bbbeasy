const { defineConfig } = require('cypress');
const { Pool } = require('pg');

const username = 'bbbeasy';
const hostname = 'localhost';
const dbname = 'bbbeasy';
const secret = 'bbbeasy';

require('dotenv').config();
module.exports = defineConfig({
    e2e: {
        baseUrl: process.env.REACT_APP_URL,
        setupNodeEvents(on, config) {
            require("@cypress/code-coverage/task")(on, config);
            on("file:preprocessor", require("@cypress/code-coverage/use-babelrc"));
            on("task", { database({ sql, values }) {
                const pool = new Pool({
                    user: username,
                    host: hostname,
                    database: dbname,
                    password: secret
                });
                try { return pool.query(sql, values) } catch (e) { }
            }});
            config.env = process.env;
            return config;
        }
    }
});
