import { test as base, Page } from '@playwright/test';
import pg from 'pg';

const { Pool } = pg;

const dbConfig = {
    user: 'bbbeasy',
    host: 'localhost',
    database: 'bbbeasy',
    password: 'bbbeasy',
};

type DBQueryResult = pg.QueryResult<any>;

type DBResult = {
    rows: any[];
    rowCount: number | null;
};

type Fixtures = {
    database: (sql: string, values?: any[]) => Promise<DBResult>;
    authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
    database: async ({}, use) => {
        const pool = new Pool(dbConfig);
        const dbQuery = async (sql: string, values?: any[]): Promise<DBResult> => {
            try {
                const result = await pool.query(sql, values);
                return { rows: result.rows, rowCount: result.rowCount };
            } catch {
                return { rows: [], rowCount: 0 };
            }
        };
        await use(dbQuery);
        await pool.end();
    },

    authenticatedPage: async ({ page }, use) => {
        // Not used by default, but available for tests that need an authenticated page
        await use(page);
    },
});

export { expect } from '@playwright/test';
