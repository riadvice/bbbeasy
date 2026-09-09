import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: 'bbbeasy',
    host: 'localhost',
    database: 'bbbeasy',
    password: 'bbbeasy',
};

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false, // Sequential to avoid DB conflicts
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],
    timeout: 60_000,
    use: {
        baseURL: process.env.REACT_APP_URL || 'http://bbbeasy.test',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Expose DB config to tests via worker fixture
    globalSetup: undefined,
});

// Export db config for use in fixtures
export { dbConfig };
