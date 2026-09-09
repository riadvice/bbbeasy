import { Page, expect } from '@playwright/test';

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

type DBResult = {
    rows: any[];
    rowCount: number | null;
};

type DBQuery = (sql: string, values?: any[]) => Promise<DBResult>;

// Wait helper (replaces cy.wait)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Complete the install wizard (step 1 → step 2 → step 3)
 */
export async function install(
    page: Page,
    username: string,
    email: string,
    password: string,
    hex: string,
    action: 'first' | 'last'
) {
    await page.getByRole('button', { name: '' }).first().click(); // lang button
    await page.waitForSelector('.ant-dropdown:visible', { timeout: 5000 });
    await page.locator(`.ant-dropdown:visible .ant-radio:${action}`).click({ force: true });
    await page.getByRole('button', { name: '' }).first().click(); // close lang popup

    // Step 1
    await page.locator('input#install_form_username').fill(username);
    await page.locator('input#install_form_email').fill(email);
    await page.locator('input#install_form_password').fill(password);
    await page.locator('button#submit-btn').click();

    // Step 2 — fill branding
    await page.locator('input[type=file]').first().setInputFiles({
        name: 'file.png',
        mimeType: 'application/json',
        buffer: Buffer.from('{}'),
    });
    await page.locator('button.ant-btn-icon-only').click();
    await page.locator('input[type=file]').first().setInputFiles({
        name: 'file.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{}'),
    });
    await page.locator('input[type=file]').first().setInputFiles({
        name: 'file.jpeg',
        mimeType: 'application/json',
        buffer: Buffer.from('{}'),
    });

    // Set color pickers
    const colorPickers = page.locator('span.rc-color-picker-trigger');
    const count = await colorPickers.count();
    for (let i = 0; i < count; i++) {
        await colorPickers.nth(i).click({ force: true });
        await page.locator('input.rc-color-picker-panel-params-hex').fill(hex);
        await page.locator('input.rc-color-picker-panel-params-hex').press('Enter');
    }

    await page.locator('button#submit-btn').click({ force: true });

    // Step 3
    await page.locator('div.presets-grid').first().click();
    await page.locator('button.ant-modal-close').click({ force: true });
    await page.locator('div.presets-grid').first().click();
    await page.locator('button.ant-switch').first().click({ force: true });
    await page.locator('div.ant-modal-footer').getByRole('button').click();
    await page.locator('button#submit-btn').click();
    await wait(500);

    // Verify success
    await page.waitForSelector('.ant-result', { state: 'visible', timeout: 10000 });
    await expect(page.locator('.ant-result')).toBeVisible();
}

/**
 * Register a new user and activate via DB
 */
export async function register(
    page: Page,
    username: string,
    email: string,
    password: string,
    db: DBQuery
) {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('form#register_form', { state: 'visible', timeout: 15000 });
    await page.locator('input#register_form_username').fill(username);
    await page.locator('input#register_form_email').fill(email);
    await page.locator('input#register_form_password').fill(password);
    await page.locator('input#register_form_confirmPassword').fill(password);
    await page.locator('input#register_form_agreement').check();
    await page.locator('button#submit-btn').click();
    await wait(500);
    await db(`UPDATE public.users SET status = 'active' WHERE username = $1`, [username]);
    await wait(300);
}

/**
 * Request a password reset email and navigate to change password page
 */
export async function requestEmail(
    page: Page,
    username: string,
    email: string,
    expired: boolean,
    db: DBQuery
) {
    await page.goto('/reset-password', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('form#reset', { state: 'visible', timeout: 15000 });
    await page.locator('input#reset_email').fill(email);

    // Wait for the request itself rather than a fixed delay, the token only exists
    // in the database once the backend has answered.
    const resetResponse = page.waitForResponse(
        (response) => response.url().includes('/api/account/reset-password') && response.request().method() === 'POST',
        { timeout: 15000 }
    );
    await page.locator('form#reset button[type="submit"]').click();
    await resetResponse;

    if (expired) {
        // Set token expiry to a date in the past to guarantee it's expired
        await db(
            `UPDATE public.reset_password_tokens SET expires_at = NOW() - INTERVAL '1 hour'
             WHERE token = (SELECT token FROM public.reset_password_tokens
             WHERE user_id = (SELECT id FROM public.users WHERE username = $1)
             ORDER BY created_on DESC LIMIT 1)`,
            [username]
        );
        await wait(500);
    }

    const result = await db(
        `SELECT token FROM public.reset_password_tokens
         WHERE user_id = (SELECT id FROM public.users WHERE username = $1)
         ORDER BY created_on DESC LIMIT 1`,
        [username]
    );

    if (result.rows.length > 0) {
        // Clear auth state so PublicRoute doesn't redirect away from /change-password
        await page.evaluate(() => localStorage.clear());
        await page.goto(`/change-password?token=${result.rows[0].token}`);
        await page.waitForSelector('form#change, .ant-result', { state: 'visible', timeout: 15000 });
    }
}

/**
 * Change password and verify redirect to login
 */
export async function changePassword(page: Page, password: string) {
    await page.waitForSelector('input#change_password', { state: 'visible', timeout: 15000 });
    await page.locator('input#change_password').fill(password);
    await page.locator('input#change_confirmPassword').fill(password);
    await page.locator('form#change button[type="submit"]').click();
    // Wait for the success page — Ant Design Result component
    await page.waitForSelector('.ant-result', { state: 'visible', timeout: 15000 });
    // Click the 'Login now' button (renders as <button>, not <a>)
    await page.locator('.ant-result button').click();
    await page.waitForURL(/\/login/, { timeout: 10000 });
}

/**
 * Login with email and password
 */
export async function login(page: Page, email: string, password: string) {
    await page.goto('/login', {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('form#login_form', { state: 'visible', timeout: 15000 });
    await page.locator('input#login_form_email').fill(email);
    await page.locator('input#login_form_password').fill(password);
    await page.locator('button#submit-btn').click();
    // Wait for redirect to home page (notification appears, then redirects)
    await page.waitForURL((url) => {
        const path = url.pathname;
        return path === '/' || path === '/home' || path === '/rooms';
    }, { timeout: 10000 });
    await wait(500);
}

/**
 * Locate a row in a table by key, with pagination support
 */
export async function locate(
    page: Page,
    index: number,
    key?: string,
    action?: string,
    color?: string
) {
    const rows = page.locator('tbody.ant-table-tbody tr.ant-table-row');
    const rowCount = Math.min(await rows.count(), 5);
    let found = false;

    for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const firstCell = ((await row.locator('td').first().textContent()) || '').trim();
        const secondCell = ((await row.locator('td').nth(1).textContent()) || '').trim();

        const matchFirst = capitalize(key || '') && firstCell.includes(capitalize(key || ''));
        const matchSecond = key && secondCell.includes(key);

        if (matchFirst && action === 'mouseover' && !color) {
            // Roles: dispatch mouseover on name cell to reveal the edit icon, then click it
            const td = row.locator('td').first();
            await td.evaluate((el) => {
                el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            });
            await wait(300);
            await row.locator('.cell-edit-icon').first().waitFor({ state: 'visible', timeout: 5000 });
            await row.locator('.cell-edit-icon').first().click();
            found = true;
            break;
        } else if (matchFirst && (action === 'first' || action === 'last') && !color) {
            // Roles: click the first (permissions) or last (delete) <a> link in the actions column
            const lastCellLinks = row.locator('td').last().locator('a');
            const linkCount = await lastCellLinks.count();
            if (linkCount === 0) return; // No action links (e.g. deleted row) — nothing to click
            if (action === 'first') {
                await lastCellLinks.first().click();
            } else {
                await lastCellLinks.last().click();
            }
            found = true;
            break;
        } else if (matchSecond && action && !color) {
            // Users: click the first (edit) or last (delete) <a> link in the actions column
            const lastCellLinks = row.locator('td').last().locator('a');
            const linkCount = await lastCellLinks.count();
            if (linkCount === 0) return; // No action links (e.g. deleted row) — nothing to click
            if (action === 'first') {
                await lastCellLinks.first().click();
            } else {
                await lastCellLinks.last().click();
            }
            found = true;
            break;
        } else if (matchSecond && !action && color) {
            await expect(row.locator('td').nth(3).locator(`.ant-tag${color}`)).toBeVisible();
            found = true;
            break;
        }
    }

    if (!found && index - 5 > 0) {
        // Close any open modal before clicking pagination
        const modal = page.locator('.ant-modal-wrap:not([style*="display: none"])');
        if (await modal.count() > 0) {
            const closeBtn = page.locator('.ant-modal-wrap:not([style*="display: none"]) button.ant-modal-close');
            if (await closeBtn.count() > 0) {
                await closeBtn.click();
                await wait(300);
            }
        }
        await page.locator('li.ant-pagination-next').click();
        await locate(page, index - 5, key, action, color);
    }
}

/**
 * Add admin via install wizard
 */
export async function addAdmin(page: Page, username: string, email: string, password: string) {
    await page.goto('/');
    await page.locator('input#install_form_username').fill(username);
    await page.locator('input#install_form_email').fill(email);
    await page.locator('input#install_form_password').fill(password);
    await page.locator('button#submit-btn').click();
    await wait(500);
    await page.locator('button#submit-btn').click();
    await page.locator('button#submit-btn').click();
    await wait(500);
}

/**
 * Add a new role
 */
export async function addRole(page: Page, rolename: string) {
    await page.locator('button#add-role-btn').click();
    await page.waitForSelector('form#roles_form', { state: 'visible', timeout: 5000 });
    await page.locator('input#roles_form_name').fill(rolename);
    await wait(300);
    await page.locator('form#roles_form button[type="submit"]').click();
    // Wait for notification to appear (confirms success) or error message
    await page.waitForSelector('.ant-notification-notice, .ant-form-item-has-error, div.alert-msg', { state: 'attached', timeout: 10000 });
    // Wait for modal to close
    await page.waitForSelector('.ant-modal-wrap:not([style*="display: none"])', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await wait(500);
}

/**
 * Add a new user
 */
export async function addUser(page: Page, username: string, email: string, password: string) {
    const rolename = 'lecturer';
    await page.locator('button#add-user-btn').click();
    await page.waitForSelector('form#users_form', { state: 'visible', timeout: 10000 });
    await page.locator('input#users_form_username').fill(username);
    await page.locator('input#users_form_email').fill(email);
    await page.locator('input#users_form_password').fill(password);
    // In antd v5, the Select trigger inside a Form.Item may not render as an <input> with the expected id.
    // Click the .ant-select-selector in the role Form.Item instead.
    const roleFormItem = page.locator('form#users_form').locator('.ant-form-item').filter({ hasText: /role|Role/i });
    await roleFormItem.locator('.ant-select-selector').click();
    await page.waitForSelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)', { state: 'visible', timeout: 5000 });
    // Wait for options to be rendered
    await wait(500);
    const options = page.locator('.ant-select-item-option-content');
    const count = await options.count();
    let roleFound = false;
    for (let i = 0; i < count; i++) {
        const optionText = ((await options.nth(i).textContent()) || '').trim();
        if (optionText.toLowerCase() === rolename.toLowerCase()) {
            await options.nth(i).click();
            roleFound = true;
            break;
        }
    }
    if (!roleFound && count > 1) {
        // Fallback: click the first non-empty option that's not Administrator
        for (let i = 0; i < count; i++) {
            const optionText = ((await options.nth(i).textContent()) || '').trim();
            if (optionText && optionText.toLowerCase() !== 'administrator') {
                await options.nth(i).click();
                break;
            }
        }
    }
    await wait(300);
    // Close the dropdown by clicking elsewhere
    await page.locator('form#users_form').click();
    await wait(200);
    await page.locator('button#submit-btn').click();
    // Wait for notification (success or error) or modal to close
    await page.waitForSelector('.ant-notification-notice, div.alert-msg', { state: 'attached', timeout: 10000 }).catch(() => {});
    await page.waitForSelector('.ant-modal-wrap:not([style*="display: none"])', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await wait(500);
}

/**
 * Update user status
 */
export async function updateStatus(
    page: Page,
    email: string,
    action: string,
    color: string,
    status: string,
    db: DBQuery
) {
    const result = await db('SELECT * FROM public.users;');
    await locate(page, result.rows.length, email, action);
    await page.locator('tr.ant-table-row td:nth-child(4) .ant-select').click();
    const options = page.locator('div.ant-select-item-option-content');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
        if ((await options.nth(i).textContent()) === capitalize(status)) {
            await options.nth(i).click();
            break;
        }
    }
    // Find the save button — in antd v5 it may be wrapped in a Space div
    const saveBtn = page.locator('tr.ant-table-row td:last-child button.ant-btn-primary, tr.ant-table-row td:last-child .ant-btn-primary');
    await saveBtn.first().click();
    await wait(500);
    await page.locator('ul.ant-table-pagination').locator('li').nth(1).locator('a').click();
    const result2 = await db('SELECT * FROM public.users;');
    await locate(page, result2.rows.length, email, undefined, color);
}

/**
 * Remove test roles from DB
 */
export async function removeRole(db: DBQuery) {
    await db(`DELETE FROM public.roles_permissions WHERE role_id = (SELECT id FROM public.roles WHERE LOWER(name) IN ('tutor', 'teacher', 'student'));`);
    await db(`DELETE FROM public.roles WHERE LOWER(name) IN ('tutor', 'teacher', 'student');`);
}

/**
 * Remove user from DB
 */
export async function removeUser(username: string, db: DBQuery) {
    const lowerUsername = username.toLowerCase();
    // Also delete by email pattern in case user exists with different username
    await db(
        `DELETE FROM public.reset_password_tokens WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(username) = $1);`,
        [lowerUsername]
    );
    await db(
        `DELETE FROM public.users WHERE LOWER(username) = $1;`,
        [lowerUsername]
    );
}

/**
 * Add a new room
 */
export async function addRoom(page: Page, name: string, presetName: string) {
    // Button text can be 'New Room' (when rooms exist) or 'Create my first room' (empty state)
    await page.locator('button').filter({ hasText: /New Room|Create my first room/i }).first().click();
    await page.waitForSelector('.add-modal', { state: 'visible' });

    // Fill name
    await page.locator('.add-modal input').first().fill(name);

    // Select preset
    await page.locator('.add-modal .ant-select').first().click();
    await page.waitForSelector('.ant-select-item-option', { state: 'visible' });
    const options = page.locator('.ant-select-item-option-content');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
        if ((await options.nth(i).textContent()).toLowerCase().includes(presetName.toLowerCase())) {
            await options.nth(i).click();
            break;
        }
    }

    // Submit
    await page.locator('.add-modal button[type="submit"]').click();
    await wait(500);
}

/**
 * Add a new label
 */
export async function addLabel(page: Page, name: string, description: string) {
    await page.locator('button:has-text("New Label")').first().click();
    await page.waitForSelector('.label-add-modal', { state: 'visible' });

    // Fill name
    await page.locator('.label-add-modal input').first().fill(name);

    // Fill description
    await page.locator('.label-add-modal input').nth(1).fill(description);

    // Submit
    await page.locator('.label-add-modal button[type="submit"]').click();
    await wait(500);
}

/**
 * Delete a label by name from DB
 */
export async function removeLabel(db: DBQuery, name: string) {
    await db(`DELETE FROM public.labels WHERE name = $1;`, [name]);
}

/**
 * Remove a preset from DB
 */
export async function removePreset(db: DBQuery, name: string) {
    await db(`DELETE FROM public.preset_settings WHERE preset_id = (SELECT id FROM public.presets WHERE name = $1);`, [name]);
    await db(`DELETE FROM public.presets WHERE name = $1;`, [name]);
}

/**
 * Remove a room from DB by name
 */
export async function removeRoom(db: DBQuery, name: string) {
    await db(`DELETE FROM public.rooms WHERE name = $1;`, [name]);
}

/**
 * Wait helper
 */
export { wait };
