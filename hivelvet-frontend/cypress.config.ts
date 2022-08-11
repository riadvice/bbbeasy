import { defineConfig } from "cypress";

const { Pool } = require('pg')

export default defineConfig({
    e2e: {
        baseUrl: "http://hivelvet.test:3300",
        env: {
            PostgreSQL: {
                user: "hivelvet",
                host: "localhost",
                database: "hivelvet",
                password: "hivelvet",
                port: 5432
            }
        },
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
            return config;
        }
    }
});
