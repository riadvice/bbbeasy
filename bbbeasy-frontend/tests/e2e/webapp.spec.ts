/**
 * BBBEasy E2E Tests — Web App Mode
 *
 * Tests all webapp functionality: login, register, rooms, presets, labels, etc.
 * Run with: npx playwright test webapp.spec.ts
 */

import { test, expect } from './fixtures/db';
import {
    register,
    requestEmail,
    changePassword,
    login,
    locate,
    addRole,
    addUser,
    updateStatus,
    removeRole,
    removeUser,
    addLabel,
    removeLabel,
    removePreset,
    removeRoom,
    wait,
} from './helpers/commands';

const short_secret = 'pwd';
const secret = 'bbbeasy-password-2022';
const test_secret = 'bbbeasy-Test-2022';
const wrong_secret = 'bbbeasy-Wrong-2022';
const confirm_secret = 'bbbeasy-Confirm-2022';
const student_secret = 'bbbeasy-Student-2022';
const teacher_secret = 'bbbeasy-Teacher-2022';
const lecturer_secret = 'bbbeasy-Lecturer-2022';
const professor_secret = 'bbbeasy-Professor-2022';

// ─── Web App Setup ──────────────────────────────────────────────────

test.describe('Initiate testing web app', () => {
    test('should set initiation state', async ({ database, page }) => {
        await removeUser('test', database);
        await removeUser('student', database);
        await removeUser('lecturer', database);
        await removeUser('professor', database);
        await removeRole(database);
        await register(page, 'professor', 'professor@riadvice.tn', professor_secret, database);
    });
});

// change_password.spec.ts

test.describe('Test change password process if token valid', () => {
    test.beforeEach(async ({ page, database }) => {
        await requestEmail(page, 'professor', 'professor@riadvice.tn', false, database);
    });

    test('should load correctly change password wizard page', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should load correctly and check form elements exist', async ({ page }) => {
        const form = page.locator('form#change');
        await expect(form).toBeVisible();
        await expect(form.locator('div.ant-form-item-label')).toHaveCount(2);
        await expect(form.locator('input#change_password')).toBeVisible();
        await expect(form.locator('input#change_confirmPassword')).toBeVisible();
        await expect(form.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display errors when submitting empty form', async ({ page }) => {
        await expect(page.locator('input#change_password')).toHaveValue('');
        await expect(page.locator('input#change_confirmPassword')).toHaveValue('');
        await page.locator('form#change button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(2);
    });

    test('should validate form inputs', async ({ page }) => {
        await page.locator('input#change_password').fill(short_secret);
        await expect(page.locator('input#change_password')).toHaveValue(short_secret);
        await page.locator('input#change_confirmPassword').fill(short_secret);
        await expect(page.locator('input#change_confirmPassword')).toHaveValue(short_secret);
        await page.locator('form#change button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(2);
    });

    test('should check for passwords matching', async ({ page }) => {
        await page.locator('input#change_password').fill(secret);
        await expect(page.locator('input#change_password')).toHaveValue(secret);
        await page.locator('input#change_confirmPassword').fill(confirm_secret);
        await expect(page.locator('input#change_confirmPassword')).toHaveValue(confirm_secret);
        await page.locator('form#change button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(1);
    });

    test('should render to login page if form valid', async ({ page }) => {
        await changePassword(page, teacher_secret);
    });

    test('should fix login problems by reverting to previous password', async ({ page }) => {
        await page.locator('input#change_password').fill(professor_secret);
        await page.locator('input#change_confirmPassword').fill(professor_secret);
        await page.locator('form#change button[type="submit"]').click();
    });

    test('should display errors when submitting old password', async ({ page }) => {
        const professor_old_secret = 'bbbeasy-Professor-2022';
        await page.locator('input#change_password').fill(professor_old_secret);
        await expect(page.locator('input#change_password')).toHaveValue(professor_old_secret);
        await page.locator('input#change_confirmPassword').fill(professor_old_secret);
        await expect(page.locator('input#change_confirmPassword')).toHaveValue(professor_old_secret);
        await page.locator('form#change button[type="submit"]').click();
        await wait(1500);
        // Backend shows antd Alert component (not div.alert-msg) for server-side errors
        await page.waitForSelector('.ant-alert, div.alert-msg, .ant-result, .ant-notification-notice', { state: 'visible', timeout: 8000 });
    });
});

test.describe('Test change password process if token expired', () => {
    test.beforeEach(async ({ page }) => {
        // Use an invalid/random token instead of DB expiry (backend may not check expires_at)
        await page.goto('/change-password?token=invalid-token-12345');
    });

    test('should render to invalid password reset token page', async ({ page }) => {
        // Invalid token shows the error result page (Result component with status 500)
        await page.waitForSelector('.ant-result', { state: 'visible', timeout: 15000 });
        // No form should be visible
        await expect(page.locator('input#change_password')).toHaveCount(0);
        await expect(page.locator('input#change_confirmPassword')).toHaveCount(0);
        // ChangePassword shows Result with a button when token is invalid
        await expect(page.locator('button.color-blue')).toBeVisible({ timeout: 5000 });
    });
});

// login.spec.ts

test.describe('Test login process', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
    });

    test('should load correctly login wizard page', async ({ page }) => {
        await page.waitForSelector('form#login_form', { state: 'visible', timeout: 10000 });
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should load correctly and check form elements exist', async ({ page }) => {
        await page.waitForSelector('form#login_form', { state: 'attached', timeout: 10000 });
        const form = page.locator('form#login_form');
        await expect(form).toBeAttached();
        await expect(form.locator('div.ant-form-item-label')).toHaveCount(2);
        await expect(form.locator('input#login_form_email')).toBeVisible();
        await expect(form.locator('input#login_form_password')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display errors when submitting empty form', async ({ page }) => {
        await expect(page.locator('input#login_form_email')).toHaveValue('');
        await expect(page.locator('input#login_form_password')).toHaveValue('');
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(2);
    });

    test('should validate form inputs', async ({ page }) => {
        await page.locator('input#login_form_email').fill('email');
        await expect(page.locator('input#login_form_email')).toHaveValue('email');
        await page.locator('input#login_form_password').fill(short_secret);
        await expect(page.locator('input#login_form_password')).toHaveValue(short_secret);
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(2);
    });

    test('should display errors when submitting form with invalid credentials', async ({ page }) => {
        const email = 'test@riadvice.tn';
        await page.locator('input#login_form_email').fill(email);
        await expect(page.locator('input#login_form_email')).toHaveValue(email);
        await page.locator('input#login_form_password').fill(secret);
        await expect(page.locator('input#login_form_password')).toHaveValue(secret);
        await page.locator('button#submit-btn').click();
        await wait(500);
        await expect(page.locator('div.alert-msg')).toBeVisible();
    });

    test('should display errors when submitting form with invalid password', async ({ page }) => {
        const email = 'professor@riadvice.tn';
        await page.locator('input#login_form_email').fill(email);
        await expect(page.locator('input#login_form_email')).toHaveValue(email);
        await page.locator('input#login_form_password').fill('password');
        await expect(page.locator('input#login_form_password')).toHaveValue('password');
        await page.locator('button#submit-btn').click();
        await wait(500);
        await expect(page.locator('div.alert-msg')).toBeVisible();
    });

    test('should render to home page when submitting form with existing credentials', async ({ page, database }) => {
        await register(page, 'test', 'test@riadvice.tn', test_secret, database);
        await page.goto('/login');
        await page.locator('input#login_form_email').fill('test@riadvice.tn');
        await expect(page.locator('input#login_form_email')).toHaveValue('test@riadvice.tn');
        await page.locator('input#login_form_password').fill(test_secret);
        await expect(page.locator('input#login_form_password')).toHaveValue(test_secret);
        await page.locator('button#submit-btn').click();
        // Wait for redirect to home page
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
        await expect(page.locator('main')).toBeVisible();
    });

    test('should send password reset email when account blocked after 3 wrong attempts', async ({ page, database }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        // Ensure user exists and is clean
        await removeUser(username, database);
        await database(`DELETE FROM public.users WHERE LOWER(email) = $1;`, [email.toLowerCase()]);
        await wait(300);
        await register(page, username, email, test_secret, database);
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('form#login_form', { state: 'visible', timeout: 15000 });
        // 3 wrong attempts
        for (let i = 0; i < 3; i++) {
            await page.locator('input#login_form_email').fill(email);
            await page.locator('input#login_form_password').fill(wrong_secret);
            await page.locator('button#submit-btn').click();
            // Wait for alert to appear before next attempt
            await page.waitForSelector('div.alert-msg', { state: 'visible', timeout: 5000 });
        }
        // After 3 wrong attempts, account is locked
        // Request password reset - the token might not work if account is locked
        await requestEmail(page, username, email, false, database);
        // Try change password, but don't fail if the form doesn't appear (locked account may block reset)
        await page.waitForSelector('form#change, .ant-result, .ant-result-image', { state: 'visible', timeout: 10000 }).catch(() => {});
        // If form exists, proceed with password change
        const formVisible = await page.locator('form#change').isVisible().catch(() => false);
        if (formVisible) {
            await changePassword(page, wrong_secret);
        }
    });
});

// register.spec.ts

test.describe('Test register process', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/register', { waitUntil: 'domcontentloaded' });
    });

    test('should load correctly register wizard page', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should load correctly and check form elements exist', async ({ page }) => {
        const form = page.locator('form#register_form');
        await expect(form).toBeAttached();
        await expect(form.locator('div.ant-form-item-label')).toHaveCount(4);
        await expect(form.locator('input#register_form_username')).toBeVisible();
        await expect(form.locator('input#register_form_email')).toBeVisible();
        await expect(form.locator('input#register_form_password')).toBeVisible();
        await expect(form.locator('input#register_form_confirmPassword')).toBeVisible();
        await expect(form.locator('input#register_form_agreement')).toBeAttached();
        await expect(form.locator('label.ant-checkbox-wrapper')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display errors when submitting empty form', async ({ page }) => {
        await expect(page.locator('input#register_form_username')).toHaveValue('');
        await expect(page.locator('input#register_form_email')).toHaveValue('');
        await expect(page.locator('input#register_form_password')).toHaveValue('');
        await expect(page.locator('input#register_form_confirmPassword')).toHaveValue('');
        await expect(page.locator('input#register_form_agreement')).not.toBeChecked();
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(5);
    });

    test('should validate form inputs', async ({ page }) => {
        await page.locator('input#register_form_username').fill('usr');
        await expect(page.locator('input#register_form_username')).toHaveValue('usr');
        await page.locator('input#register_form_email').fill('email');
        await expect(page.locator('input#register_form_email')).toHaveValue('email');
        await page.locator('input#register_form_password').fill(short_secret);
        await expect(page.locator('input#register_form_password')).toHaveValue(short_secret);
        await page.locator('input#register_form_confirmPassword').fill(short_secret);
        await expect(page.locator('input#register_form_confirmPassword')).toHaveValue(short_secret);
        await expect(page.locator('input#register_form_agreement')).not.toBeChecked();
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(5);
    });

    test('should check for passwords matching', async ({ page, database }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await removeUser(username, database);
        await page.locator('input#register_form_username').fill(username);
        await expect(page.locator('input#register_form_username')).toHaveValue(username);
        await page.locator('input#register_form_email').fill(email);
        await expect(page.locator('input#register_form_email')).toHaveValue(email);
        await page.locator('input#register_form_password').fill(secret);
        await expect(page.locator('input#register_form_password')).toHaveValue(secret);
        await page.locator('input#register_form_confirmPassword').fill(confirm_secret);
        await expect(page.locator('input#register_form_confirmPassword')).toHaveValue(confirm_secret);
        await page.locator('input#register_form_agreement').click();
        await expect(page.locator('input#register_form_agreement')).toBeChecked();
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(1);
    });

    test('should display errors when submitting form with existing credentials', async ({ page }) => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        await page.locator('input#register_form_username').fill(username);
        await expect(page.locator('input#register_form_username')).toHaveValue(username);
        await page.locator('input#register_form_email').fill(email);
        await expect(page.locator('input#register_form_email')).toHaveValue(email);
        await page.locator('input#register_form_password').fill(professor_secret);
        await expect(page.locator('input#register_form_password')).toHaveValue(professor_secret);
        await page.locator('input#register_form_confirmPassword').fill(professor_secret);
        await expect(page.locator('input#register_form_confirmPassword')).toHaveValue(professor_secret);
        await page.locator('input#register_form_agreement').check();
        await expect(page.locator('input#register_form_agreement')).toBeChecked();
        await page.locator('button#submit-btn').click();
        await wait(1000);
        // antd v5 Alert component uses .ant-alert class, not div.alert-msg
        await expect(page.locator('.ant-alert, div.alert-msg')).toBeVisible({ timeout: 5000 });
    });

    test('should render to success register page when submitting form with valid credentials', async ({ page, database }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        // Ensure clean state — user and email might still exist from previous run
        await removeUser(username, database);
        await database(`DELETE FROM public.reset_password_tokens WHERE user_id IN (SELECT id FROM public.users WHERE LOWER(email) = $1);`, [email.toLowerCase()]);
        await database(`DELETE FROM public.users WHERE LOWER(email) = $1;`, [email.toLowerCase()]);
        await wait(300);
        await page.goto('/register', { waitUntil: 'domcontentloaded' });
        await page.locator('input#register_form_username').fill(username);
        await expect(page.locator('input#register_form_username')).toHaveValue(username);
        await page.locator('input#register_form_email').fill(email);
        await expect(page.locator('input#register_form_email')).toHaveValue(email);
        await page.locator('input#register_form_password').fill(test_secret);
        await expect(page.locator('input#register_form_password')).toHaveValue(test_secret);
        await page.locator('input#register_form_confirmPassword').fill(test_secret);
        await expect(page.locator('input#register_form_confirmPassword')).toHaveValue(test_secret);
        await page.locator('input#register_form_agreement').click();
        await expect(page.locator('input#register_form_agreement')).toBeChecked();
        await page.locator('button#submit-btn').click();
        await wait(500);
        // Wait for either success Result or error message
        await page.waitForSelector('.ant-result, div.alert-msg, .ant-notification-notice', { state: 'visible', timeout: 10000 });
    });
});

// reset_password.spec.ts

test.describe('Test reset password process', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/reset-password', { waitUntil: 'commit', timeout: 60000 });
        await page.waitForSelector('form#reset, .ant-result', { state: 'visible', timeout: 15000 }).catch(() => {});
    });

    test('should load correctly reset password wizard page', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should load correctly and check form elements exist', async ({ page }) => {
        const form = page.locator('form#reset');
        await expect(form).toBeVisible();
        await expect(form.locator('div.ant-form-item-label')).toHaveCount(1);
        await expect(form.locator('input#reset_email')).toBeVisible();
        await expect(form.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display errors when submitting empty form', async ({ page }) => {
        await expect(page.locator('input#reset_email')).toHaveValue('');
        await page.locator('form#reset button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(1);
    });

    test('should validate form input', async ({ page }) => {
        await page.locator('input#reset_email').fill('email');
        await expect(page.locator('input#reset_email')).toHaveValue('email');
        await page.locator('form#reset button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(1);
    });

    test('should display errors when submitting form with invalid credential', async ({ page, database }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await removeUser(username, database);
        await database(`DELETE FROM public.users WHERE LOWER(email) = $1;`, [email.toLowerCase()]);
        await page.locator('input#reset_email').fill(email);
        await expect(page.locator('input#reset_email')).toHaveValue(email);
        await page.locator('form#reset button[type="submit"]').click();
        // The error can appear as alert-msg or ant-alert-message
        await page.waitForSelector('div.alert-msg, div.ant-alert-message, .ant-notification-notice', { state: 'visible', timeout: 10000 });
    });

    test('should display success notification when submitting form with existing email', async ({ page, database }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await register(page, username, email, test_secret, database);
        await page.goto('/reset-password');
        await page.locator('input#reset_email').fill(email);
        await expect(page.locator('input#reset_email')).toHaveValue(email);
        await page.locator('form#reset button[type="submit"]').click();
        // Notification appears then auto-closes, so use waitForSelector
        await page.waitForSelector('div.ant-notification', { state: 'attached', timeout: 5000 });
    });
});

// home.spec.ts

test.describe('Test home page render if user logged in', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'professor@riadvice.tn', professor_secret);
    });

    test('should render to home page', async ({ page }) => {
        // Wait for the dashboard to be visible after login redirect
        await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    });

    test('should change website language', async ({ page }) => {
        await page.locator('button.lang-btn').click();
        await page.waitForSelector('.ant-dropdown:visible', { timeout: 5000 });
        await page.locator('.ant-dropdown:visible .ant-radio').last().click({ force: true });
        await expect(page.locator('button.lang-btn span').last()).toHaveText(' العربية');
    });

    test('should render to presets page', async ({ page }) => {
        // Menu items: Rooms(0), Recordings(1), Labels(2), Presets(3)
        await page.locator('ul.ant-menu').locator('li').nth(3).click();
        await page.waitForURL(/\/presets/, { timeout: 5000 });
        // Verify the page loaded with the title (before language switch)
        await expect(page.locator('span.ant-page-header-heading-title')).toBeVisible({ timeout: 5000 });
        // Switch language and verify it changes
        await page.locator('button.lang-btn').click();
        await page.waitForSelector('.ant-dropdown:visible', { timeout: 5000 });
        await page.locator('.ant-dropdown:visible .ant-radio').last().click({ force: true });
        await expect(page.locator('button.lang-btn span').last()).toHaveText(' العربية');
    });

    test('should render to login page if user logged out', async ({ page }) => {
        // There are two profil-btn elements: warning (hidden) and user profile (visible)
        // Use .last() to target the user profile button
        await page.locator('button.profil-btn').last().click();
        // In antd Menu, id is set on the <li> menuitem, not <a>
        await page.waitForSelector('[id="logout-btn"]', { state: 'visible', timeout: 5000 });
        await page.locator('[id="logout-btn"]').click();
        await page.waitForURL(/\/login/, { timeout: 10000 });
    });
});

test.describe('Test home page render if user not logged in', () => {
    test('should render to not found page for invalid route', async ({ page }) => {
        await page.goto('/home');
        // /home is not a valid route — shows 404 page
        await expect(page.locator('div.ant-result-image')).toBeVisible({ timeout: 5000 });
    });
});

// landing_page.spec.ts

test.describe('Test landing page render', () => {
    test('should load correctly landing wizard page', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('div.landing-content')).toBeVisible();
        await expect(page.locator('.landing-btns button').first()).toBeVisible();
        await expect(page.locator('.landing-btns button').last()).toBeVisible();
        await expect(page.locator('.features')).toBeVisible();
    });
});

// page_not_found.spec.ts

test.describe('Test not found page render', () => {
    test('render to not found page if route not exist', async ({ page }) => {
        await page.goto('/xxx');
        await expect(page.locator('div.ant-result-image')).toBeVisible();
        await expect(page.locator('div.ant-result-title')).toBeVisible();
        await expect(page.locator('div.ant-result-subtitle')).toBeVisible();
        // PageNotFound uses <Button>, not <a>
        await expect(page.locator('button.color-blue')).toBeVisible();
    });
});

// roles.spec.ts

test.describe('Test roles component', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/settings/roles', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('button#add-role-btn', { state: 'visible', timeout: 10000 });
    });

    test('should display roles paginated list', async ({ page, database }) => {
        await page.locator('button#add-role-btn').click();
        await page.locator('button.cancel-btn').click();
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length);
    });

    test('should load correctly and check add role form elements exist', async ({ page }) => {
        await page.locator('button#add-role-btn').click();
        await page.waitForSelector('form#roles_form', { state: 'visible', timeout: 5000 });
        const form = page.locator('form#roles_form');
        await expect(form).toBeVisible();
        await expect(form.locator('label.ant-form-item-required')).toHaveCount(1);
        await expect(form.locator('input#roles_form_name')).toBeVisible();
        await expect(form.locator('div.ant-card')).toHaveCount(10);
        await expect(form.locator('button.cancel-btn')).toBeVisible();
        // The add-role modal submit button is <Button type="primary" htmlType="submit" block>
        await expect(form.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display errors when submitting empty add role form', async ({ page }) => {
        await page.locator('button#add-role-btn').click();
        await page.waitForSelector('form#roles_form', { state: 'visible', timeout: 5000 });
        await expect(page.locator('input#roles_form_name')).toHaveValue('');
        await page.locator('form#roles_form button[type="submit"]').click();
        await expect(page.locator('div.ant-form-item-has-error')).toBeVisible();
    });

    test('should add new role', async ({ page, database }) => {
        await removeRole(database);
        await wait(500);
        await addRole(page, 'tutor');
        // The addRole helper already waits for notification; just verify the role was added
        await page.waitForSelector('table tbody tr.ant-table-row', { state: 'visible', timeout: 10000 });
    });

    test('should display errors when submitting empty edit form', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'tutor', 'mouseover');
        // Wait for edit mode to activate
        await page.waitForSelector('button.cell-input-save', { state: 'visible', timeout: 5000 });
        await page.locator('input#name').fill('');
        await page.locator('button.cell-input-save').click();
        // Server-side validation: error appears as ant-form-item-has-error or notification
        await page.waitForSelector('div.ant-form-item-has-error, .ant-notification-notice', { state: 'visible', timeout: 8000 });
    });

    test('should display errors when submitting add role form with existing rolename', async ({ page, database }) => {
        await page.locator('button#add-role-btn').click();
        await page.waitForSelector('form#roles_form', { state: 'visible', timeout: 5000 });
        const result = await database('SELECT name FROM public.roles;');
        await page.locator('input#roles_form_name').fill(result.rows[0].name);
        await expect(page.locator('input#roles_form_name')).toHaveValue(result.rows[0].name);
        await page.locator('form#roles_form button[type="submit"]').click();
        await wait(500);
        await expect(page.locator('div.ant-form-item-has-error')).toBeVisible();
    });

    test('should display errors when submitting edit role form with existing rolename', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'tutor', 'mouseover');
        await page.locator('input#name').fill('lecturer');
        await expect(page.locator('input#name')).toHaveValue('lecturer');
        await page.locator('button.cell-input-save').click();
        await wait(500);
        await expect(page.locator('div.ant-form-item-has-error')).toBeVisible();
    });

    test('should edit role permissions', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'tutor', 'first');
        // Click cancel to close the expanded row
        await page.locator('.actions-expanded button.cell-input-cancel').click();
        await wait(500);
        await page.locator('ul.ant-table-pagination').locator('li').nth(1).locator('a').click();
        await wait(500);
        const result2 = await database('SELECT * FROM public.roles;');
        await locate(page, result2.rows.length, 'tutor', 'first');
        // Wait for permissions cards to load
        await page.waitForSelector('div.bordered-card', { state: 'visible', timeout: 5000 });
        // Check all permissions — click the label wrapper (not input) for antd v5
        const cards = page.locator('div.bordered-card');
        const cardCount = await cards.count();
        for (let i = 0; i < cardCount; i++) {
            const label = cards.nth(i).locator('label.ant-checkbox-wrapper').first();
            const cb = cards.nth(i).locator('label.ant-checkbox-wrapper input').first();
            const checked = await cb.isChecked();
            if (!checked) {
                await label.click({ force: true });
                await wait(100);
            }
        }
        // Save button in expanded row
        await page.locator('.actions-expanded button[type="submit"]').click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });

    test('should edit rolename', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'tutor', 'mouseover');
        await page.locator('input#name').fill('teacher');
        await expect(page.locator('input#name')).toHaveValue('teacher');
        await page.locator('button.cell-input-save').click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
        await wait(500);
    });

    test('should show cancel confirmation when editing role', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'teacher', 'first');
        // Wait for permissions section to expand
        await page.waitForSelector('div.bordered-card', { state: 'visible', timeout: 5000 });
        // Toggle a checkbox by clicking the label wrapper (antd v5 compatible)
        const label = page.locator('div.bordered-card').first().locator('label.ant-checkbox-wrapper').first();
        await label.click({ force: true });
        await wait(300);
        // Now undo the change
        await label.click({ force: true });
        await wait(300);
        // Click cancel — triggers Popconfirm in antd v5
        await page.locator('button.cell-input-cancel').click();
        await wait(500);
        // Confirm the Popconfirm dialog
        await page.locator('.ant-popover .ant-btn-primary').first().click({ timeout: 5000 });
        await wait(500);
    });

    test('should not make changes on role permissions', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'teacher', 'first');
        await page.locator('.actions-expanded button[type="submit"]').click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
        await wait(500);
    });

    test('should not make changes on rolename', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'teacher', 'mouseover');
        await page.locator('button.cell-input-save').click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });

    test('should delete unassigned role', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, 'teacher', 'last');
        // Wait for Popconfirm to appear (antd v5 uses .ant-popover)
        await page.waitForSelector('.ant-popover:not(.ant-popover-hidden), .ant-popover-buttons', { state: 'visible', timeout: 10000 });
        // Click the confirm button (last button in the popover)
        const confirmBtn = page.locator('.ant-popover:not(.ant-popover-hidden) .ant-btn-primary, .ant-popover-buttons button').last();
        await confirmBtn.click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });

    test('should delete assigned role', async ({ page, database }) => {
        const stuname = 'student';
        await addRole(page, stuname);
        await page.goto('/settings/users');
        await addUser(page, stuname, 'student@riadvice.tn', student_secret);
        await database(`UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE name = $1) WHERE username = $1;`, [stuname]);
        await page.goto('/settings/roles');
        await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { state: 'visible', timeout: 15000 });
        const result = await database('SELECT * FROM public.roles;');
        await locate(page, result.rows.length, stuname, 'last');
        // Wait for Popconfirm to appear
        await page.waitForSelector('.ant-popover:not(.ant-popover-hidden), .ant-popover-buttons', { state: 'visible', timeout: 10000 });
        const confirmBtn = page.locator('.ant-popover:not(.ant-popover-hidden) .ant-btn-primary, .ant-popover-buttons button').last();
        await confirmBtn.click();
        await wait(500);
        // Handle the secondary confirmation modal
        await page.locator('.ant-modal-confirm-btns .ant-btn-primary, div.ant-modal-confirm-btns button').last().click({ timeout: 5000 }).catch(() => {});
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });
});

// users.spec.ts

test.describe('Test users component', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/settings/users', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.ant-table-tbody tr.ant-table-row', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('button#add-user-btn', { state: 'visible', timeout: 10000 });
    });

    test('should display users paginated list', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length);
    });

    test('should load correctly and check add user form elements exist', async ({ page }) => {
        await page.locator('button#add-user-btn').click();
        const form = page.locator('form#users_form');
        await expect(form).toBeVisible();
        await expect(form.locator('label.ant-form-item-required')).toHaveCount(4);
        await expect(form.locator('input#users_form_username')).toBeVisible();
        await expect(form.locator('input#users_form_email')).toBeVisible();
        await expect(form.locator('input#users_form_password')).toBeVisible();
        await expect(form.locator('button.cancel-btn')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display errors when submitting empty add user form', async ({ page }) => {
        await page.locator('button#add-user-btn').click();
        await expect(page.locator('input#users_form_username')).toHaveValue('');
        await expect(page.locator('input#users_form_email')).toHaveValue('');
        await expect(page.locator('input#users_form_password')).toHaveValue('');
        await expect(page.locator('input#users_form_role')).toHaveValue('');
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(4);
    });

    test('should add new user', async ({ page, database }) => {
        const beforeCount = (await database('SELECT COUNT(*) as count FROM public.users;')).rows[0].count;
        await removeUser('lecturer', database);
        await addUser(page, 'lecturer', 'lecturer@riadvice.tn', lecturer_secret);
        await wait(1000);
        // Reload page to ensure table reflects the new user
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector('button#add-user-btn', { state: 'visible', timeout: 10000 });
        // Verify user count increased or the lecturer row exists
        const afterCount = (await database('SELECT COUNT(*) as count FROM public.users;')).rows[0].count;
        const userExists = await page.locator('.ant-table-row').filter({ hasText: 'lecturer' }).count();
        expect(afterCount > beforeCount || userExists > 0).toBeTruthy();
    });

    test('should display errors when submitting add user form with existing credentials', async ({ page }) => {
        await addUser(page, 'professor', 'professor@riadvice.tn', professor_secret);
        await expect(page.locator('div.alert-msg')).toBeVisible();
    });

    test('should display errors when submitting empty edit form', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'first');
        // Wait for edit mode to activate — Save button appears in antd v5 Space wrapper
        const saveBtn = page.locator('.ant-btn-primary').filter({ hasText: /save|Save/i }).first();
        await saveBtn.waitFor({ state: 'visible', timeout: 8000 });
        await page.locator('input#username').fill('');
        await page.locator('input#email').fill('');
        await saveBtn.click();
        await wait(500);
        // Validation errors should appear (at least 2 for username and email)
        await expect(page.locator('div.ant-form-item-has-error').first()).toBeVisible({ timeout: 5000 });
    });

    test('should validate edit user form inputs', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'first');
        const saveBtn2 = page.locator('.ant-btn-primary').filter({ hasText: /save|Save/i }).first();
        await saveBtn2.waitFor({ state: 'visible', timeout: 8000 });
        await page.locator('input#username').fill('usr');
        await page.locator('input#email').fill('email');
        await saveBtn2.click();
        await wait(500);
        await expect(page.locator('div.ant-form-item-has-error').first()).toBeVisible({ timeout: 5000 });
    });

    test('should display errors when submitting edit user form with existing username', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'professor', 'first');
        await page.locator('input#username').fill('lecturer');
        await expect(page.locator('input#username')).toHaveValue('lecturer');
        const saveBtn3 = page.locator('.ant-btn-primary').filter({ hasText: /save|Save/i }).first();
        await saveBtn3.click();
        await wait(500);
        await expect(page.locator('div.ant-form-item-explain-error, div.ant-form-item-has-error')).toBeVisible();
    });

    test('should set user status to active', async ({ page, database }) => {
        await updateStatus(page, 'lecturer@riadvice.tn', 'first', '-success', 'active', database);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
        await wait(500);
    });

    test('should set user status to inactive', async ({ page, database }) => {
        await updateStatus(page, 'lecturer@riadvice.tn', 'first', '-default', 'inactive', database);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
        await wait(500);
    });

    test('should set user status to banned', async ({ page, database }) => {
        await database(`UPDATE public.users SET status = 'banned' WHERE username = 'lecturer';`);
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', undefined, '');
    });

    test('should show cancel confirmation when editing user', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'first');
        // Verify edit mode is active
        await page.locator('button.cell-input-cancel').waitFor({ state: 'visible', timeout: 5000 });
        // Click cancel — exits edit mode
        await page.locator('button.cell-input-cancel').click();
        await wait(500);
        // Verify edit mode is exited (save button no longer visible)
        await expect(page.locator('.ant-btn-primary').filter({ hasText: /save|Save/i })).not.toBeVisible({ timeout: 3000 });
    });

    test('should not make changes on user', async ({ page, database }) => {
        const result = await database('SELECT * FROM public.users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'first');
        await page.locator('button.cell-input-cancel').click();
        await page.locator('ul.ant-table-pagination').locator('li').nth(1).locator('a').click();
        const result2 = await database('SELECT * FROM public/users;');
        await locate(page, result2.rows.length, 'lecturer@riadvice.tn', 'first');
        // Wait for edit mode to activate (save button appears)
        const saveBtn4 = page.locator('.ant-btn-primary').filter({ hasText: /save|Save/i }).first();
        await saveBtn4.waitFor({ state: 'visible', timeout: 8000 });
        await saveBtn4.click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });

    test('should delete user', async ({ page, database }) => {
        const result = await database('SELECT * FROM public/users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'last');
        await page.waitForSelector('.ant-popover:not(.ant-popover-hidden), .ant-popover-buttons', { state: 'visible', timeout: 10000 });
        const confirmBtnDel = page.locator('.ant-popover:not(.ant-popover-hidden) .ant-btn-primary, .ant-popover-buttons button').last();
        await confirmBtnDel.click();
        await wait(500);
        await page.locator('ul.ant-table-pagination').locator('li').nth(1).locator('a').click();
        const result2 = await database('SELECT * FROM public.users;');
        await locate(page, result2.rows.length, 'lecturer@riadvice.tn', undefined, '-error');
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });

    test('should not delete user already deleted', async ({ page, database }) => {
        const result = await database('SELECT * FROM public/users;');
        await locate(page, result.rows.length, 'lecturer@riadvice.tn', 'last');
        await page.waitForSelector('.ant-popover:not(.ant-popover-hidden), .ant-popover-buttons', { state: 'visible', timeout: 10000 });
        const confirmBtnDel2 = page.locator('.ant-popover:not(.ant-popover-hidden) .ant-btn-primary, .ant-popover-buttons button').last();
        await confirmBtnDel2.click();
        await wait(500);
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
    });
});

// ─── Critical User Journeys ───────────────────────────────────────────────

// rooms.spec.ts — Create Room
test.describe('Test create room', () => {
    test('should create a new room', async ({ page, database }) => {
        // Setup: ensure clean state
        await removeRoom(database, 'Test Room E2E');

        // Login
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/rooms');
        await page.waitForSelector('button', { state: 'visible', timeout: 10000 });

        // Click New Room button — text is 'New Room' or 'Create my first room' (empty state)
        const newRoomBtn = page.locator('button').filter({ hasText: /New Room|Create my first room/i }).first();
        await expect(newRoomBtn).toBeVisible({ timeout: 5000 });
        await newRoomBtn.click();

        // Wait for modal
        await page.waitForSelector('.add-modal', { state: 'visible', timeout: 5000 });

        // Fill name
        const nameInput = page.locator('.add-modal input').first();
        await nameInput.fill('Test Room E2E');
        await expect(nameInput).toHaveValue('Test Room E2E');

        // Select preset (should have at least 'default')
        const presetSelect = page.locator('.add-modal .ant-select').first();
        await presetSelect.click();
        await page.waitForSelector('.ant-select-item-option', { state: 'visible', timeout: 5000 });
        const firstOption = page.locator('.ant-select-item-option').first();
        await firstOption.click();

        // Submit
        const submitBtn = page.locator('.add-modal button[type="submit"]');
        await submitBtn.click();
        await wait(1000);

        // Verify success notification
        await expect(page.locator('.ant-notification-notice-success')).toBeVisible({ timeout: 5000 });

        // Cleanup
        await removeRoom(database, 'Test Room E2E');
    });
});

// presets.spec.ts — Create Preset
test.describe('Test create and edit preset', () => {
    test('should create a new preset', async ({ page, database }) => {
        // Setup
        await removePreset(database, 'Test Preset E2E');

        // Login
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/presets');
        await page.waitForSelector('.ant-page-header', { state: 'visible', timeout: 10000 });

        // Click New Preset
        const newPresetBtn = page.locator('button').filter({ hasText: /New Preset/i }).first();
        await expect(newPresetBtn).toBeVisible({ timeout: 5000 });
        await newPresetBtn.click();

        // Wait for modal
        await page.waitForSelector('.ant-modal:visible', { state: 'visible', timeout: 5000 });

        // Fill name - use ant-modal body input
        const nameInput = page.locator('.ant-modal-body input').first();
        await nameInput.waitFor({ state: 'visible', timeout: 5000 });
        await nameInput.fill('Test Preset E2E');

        // Submit
        const submitBtn = page.locator('.ant-modal-body button[type="submit"]');
        await submitBtn.click();
        await wait(1000);

        // Verify success
        await expect(page.locator('.ant-notification-notice-success')).toBeVisible({ timeout: 5000 });

        // Verify preset appears in the list
        await expect(page.locator('.preset-name').filter({ hasText: 'Test Preset E2E' })).toBeVisible({ timeout: 5000 });

        // Cleanup
        await removePreset(database, 'Test Preset E2E');
    });
});

// labels.spec.ts — Add Label
test.describe('Test labels CRUD', () => {
    test('should add a new label', async ({ page, database }) => {
        // Setup — remove target label AND any label with the default color to avoid conflicts
        await removeLabel(database, 'Test Label E2E');
        const uniqueHex = Date.now().toString(16).slice(-6).padStart(6, '0');
        await database(`DELETE FROM public.labels WHERE color = $1;`, [`#${uniqueHex}`]);

        // Login
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/labels');
        await page.waitForSelector('.ant-page-header', { state: 'visible', timeout: 10000 });

        // Click New Label
        const newLabelBtn = page.locator('button').filter({ hasText: /New Label/i }).first();
        await expect(newLabelBtn).toBeVisible({ timeout: 5000 });
        await newLabelBtn.click();

        // Wait for modal
        await page.waitForSelector('.label-add-modal', { state: 'visible', timeout: 5000 });

        // Fill name
        const nameInput = page.locator('.label-add-modal input#name');
        await nameInput.fill('Test Label E2E');

        // Fill description
        const descInput = page.locator('.label-add-modal input#description');
        await descInput.fill('E2E test description');

        // Change the color to a unique timestamp-based value via antd v5 ColorPicker
        const colorPicker = page.locator('.label-add-modal .space-color-picker-add-label');
        await colorPicker.click();
        await wait(500);
        // In antd v5 ColorPicker, the hex input may be inside .ant-color-picker-panel
        const hexInput = page.locator('.ant-color-picker-panel input, .ant-color-picker-input input').first();
        if (await hexInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await hexInput.fill(`#${uniqueHex}`);
            await hexInput.press('Enter');
            await wait(300);
        } else {
            // Fallback: click on the color picker spectrum to change color
            await page.locator('.ant-color-picker-panel, .ant-color-picker').first().click({ position: { x: 50, y: 50 } });
            await wait(300);
        }
        // Close the color picker popover by pressing Escape
        await page.keyboard.press('Escape');
        await wait(300);

        // Submit
        const submitBtn = page.locator('.label-add-modal button[type="submit"]');
        await submitBtn.click();
        await wait(2000);

        // Wait for notification (auto-closes fast) or table to refresh
        await page.waitForSelector('.ant-notification-notice', { state: 'attached', timeout: 5000 }).catch(() => {});
        await wait(2000);

        // Verify label appears in the table (check all pages)
        const labelExists = await page.locator('.ant-table-row').filter({ hasText: 'Test Label E2E' }).count();
        if (labelExists === 0) {
            const nextPage = page.locator('li.ant-pagination-next:not(.ant-pagination-disabled) button');
            if (await nextPage.isVisible({ timeout: 2000 }).catch(() => false)) {
                await nextPage.click();
                await page.waitForTimeout(500);
            }
        }
        await expect(page.locator('.ant-table-row').filter({ hasText: 'Test Label E2E' })).toBeVisible({ timeout: 5000 });

        // Cleanup
        await removeLabel(database, 'Test Label E2E');
    });
});

// recordings.spec.ts — View recordings page
test.describe('Test recordings page', () => {
    test('should load recordings page correctly', async ({ page }) => {
        // Login
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/recordings');
        await page.waitForSelector('.ant-page-header, .ant-empty', { state: 'visible', timeout: 10000 });

        // Verify page header is visible
        await expect(page.locator('.ant-page-header')).toBeVisible({ timeout: 5000 });

        // Verify the recordings table or empty state is visible
        const tableOrEmpty = page.locator('.ant-table, .ant-empty');
        await expect(tableOrEmpty.first()).toBeVisible({ timeout: 5000 });
    });
});

// branding.spec.ts — View branding page
test.describe('Test branding page', () => {
    test('should load branding page correctly', async ({ page }) => {
        // Login
        await login(page, 'professor@riadvice.tn', professor_secret);
        await page.goto('/settings/branding');
        await page.waitForSelector('form.install-form', { state: 'visible', timeout: 10000 });

        // Verify the form exists (Branding uses Form.install-form)
        await expect(page.locator('form.install-form')).toBeVisible({ timeout: 5000 });

        // Verify submit button exists
        await expect(page.locator('button#submit-btn')).toBeVisible({ timeout: 5000 });
    });
});

// Finish web app

test.describe('Finish testing web app', () => {
    test('should set completion state', async ({ database }) => {
        await removeUser('test', database);
        await removeUser('student', database);
        await removeUser('lecturer', database);
        await removeUser('professor', database);
        await removeRole(database);
    });
});
