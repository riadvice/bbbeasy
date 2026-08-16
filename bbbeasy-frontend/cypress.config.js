import { defineConfig } from 'cypress';
import pg from 'pg';
import dotenv from 'dotenv';
import coverageTask from '@cypress/code-coverage/task';
import useBabelrc from '@cypress/code-coverage/use-babelrc';

const { Pool } = pg;

const username = 'bbbeasy';
const hostname = 'localhost';
const dbname = 'bbbeasy';
const secret = 'bbbeasy';

dotenv.config();

export default defineConfig({
    e2e: {
        baseUrl: process.env.REACT_APP_URL,
        setupNodeEvents(on, config) {
            coverageTask(on, config);
            on('file:preprocessor', useBabelrc);
            on('task', {
                async database({ sql, values }) {
                    const pool = new Pool({
                        user: username,
                        host: hostname,
                        database: dbname,
                        password: secret,
                    });

                    try {
                        return await pool.query(sql, values);
                    } catch (error) {
                        return null;
                    } finally {
                        await pool.end();
                    }
                },
            });

            config.env = process.env;
            return config;
        },
    },
});
