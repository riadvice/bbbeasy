/**
 * BBBEasy E2E Tests — Installer Mode
 *
 * Tests the installation wizard: step 1 (admin), step 2 (branding), step 3 (presets).
 * Run with: npx playwright test installer.spec.ts
 */

import { test, expect } from './fixtures/db';
import { install, addAdmin, removeUser, wait } from './helpers/commands';

const short_secret = 'pwd';
const test_secret = 'bbbeasy-Test-2022';
const admin_secret = 'bbbeasy-Administrator-2022';

// ─── Installer App ────────────────────────────────────────────────────

test.describe('Wait until enabling installer app', () => {
    test('should wait for installer mode to be enabled', async ({ page }) => {
        // In CI, the app should already be in installer mode.
        // In manual testing, the user must switch the app to installer mode.
        // Give 30s to manually enable installer mode if needed.
        await wait(30000);
    });
});

test.describe('Initiate testing installer app', () => {
    test('should set initiation state', async ({ page, database }) => {
        await removeUser('test', database);
        await removeUser('administrator', database);
        await addAdmin(page, 'administrator', 'administrator@riadvice.tn', admin_secret);
    });
});

// install.spec.ts

test.describe('Test install process', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load correctly install wizard page', async ({ page }) => {
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('div.ant-steps-item')).toHaveCount(3);
    });

    test('should load correctly and check step 1 form elements exist', async ({ page }) => {
        const form = page.locator('form#install_form');
        await expect(form).toBeVisible();
        await expect(form.locator('h4.ant-typography')).toHaveCount(1);
        await expect(form.locator('label')).toHaveCount(3);
        await expect(form.locator('input#install_form_username')).toBeVisible();
        await expect(form.locator('input#install_form_email')).toBeVisible();
        await expect(form.locator('input#install_form_password')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display errors when submitting empty step 1 form', async ({ page }) => {
        await expect(page.locator('input#install_form_username')).toHaveValue('');
        await expect(page.locator('input#install_form_email')).toHaveValue('');
        await expect(page.locator('input#install_form_password')).toHaveValue('');
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(3);
    });

    test('should validate step 1 form inputs', async ({ page }) => {
        await page.locator('input#install_form_username').fill('usr');
        await expect(page.locator('input#install_form_username')).toHaveValue('usr');
        await page.locator('input#install_form_email').fill('email');
        await expect(page.locator('input#install_form_email')).toHaveValue('email');
        await page.locator('input#install_form_password').fill(short_secret);
        await expect(page.locator('input#install_form_password')).toHaveValue(short_secret);
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(3);
    });

    test('should display errors when submitting step 1 form with existing credentials', async ({ page }) => {
        const username = 'administrator';
        const email = 'administrator@riadvice.tn';
        await page.locator('input#install_form_username').fill(username);
        await expect(page.locator('input#install_form_username')).toHaveValue(username);
        await page.locator('input#install_form_email').fill(email);
        await expect(page.locator('input#install_form_email')).toHaveValue(email);
        await page.locator('input#install_form_password').fill(admin_secret);
        await expect(page.locator('input#install_form_password')).toHaveValue(admin_secret);
        await page.locator('button#submit-btn').click();
        await wait(500);
        await expect(page.locator('div.ant-alert-message')).toBeVisible();
    });

    test('should load correctly and check step 2 form elements exist', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await page.locator('input#install_form_username').fill(username);
        await page.locator('input#install_form_email').fill(email);
        await page.locator('input#install_form_password').fill(test_secret);
        await page.locator('button#submit-btn').click();
        await expect(page.locator('input#install_form_username')).toHaveCount(0);
        await expect(page.locator('input#install_form_email')).toHaveCount(0);
        await expect(page.locator('input#install_form_password')).toHaveCount(0);
        const form = page.locator('form#install_form');
        await expect(form).toBeVisible();
        await expect(form.locator('h4.ant-typography')).toHaveCount(2);
        await expect(form.locator('label')).toHaveCount(9);
        await expect(form.locator('input#install_form_company_name')).toBeVisible();
        await expect(form.locator('input#install_form_company_url')).toBeVisible();
        await expect(form.locator('input#install_form_platform_name')).toBeVisible();
        await expect(form.locator('input#install_form_term_url')).toBeVisible();
        await expect(form.locator('input#install_form_policy_url')).toBeVisible();
        await expect(form.locator('div.ant-upload')).toBeVisible();
        await expect(form.locator('span.rc-color-picker-trigger')).toHaveCount(4);
        await expect(form.locator('button.prev')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display errors when submitting empty step 2 form', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await page.locator('input#install_form_username').fill(username);
        await page.locator('input#install_form_email').fill(email);
        await page.locator('input#install_form_password').fill(test_secret);
        await page.locator('button#submit-btn').click();
        await page.locator('input#install_form_company_name').fill('');
        await page.locator('input#install_form_company_url').fill('');
        await page.locator('input#install_form_platform_name').fill('');
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(3);
    });

    test('should validate step 2 form inputs', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await page.locator('input#install_form_username').fill(username);
        await page.locator('input#install_form_email').fill(email);
        await page.locator('input#install_form_password').fill(test_secret);
        await page.locator('button#submit-btn').click();
        await page.locator('input#install_form_company_url').fill('url');
        await page.locator('input#install_form_term_url').fill('url');
        await page.locator('input#install_form_policy_url').fill('url');
        await page.locator('button#submit-btn').click();
        await expect(page.locator('div.ant-form-item-has-error')).toHaveCount(3);
    });

    test('should load correctly and check step 3 form elements exist', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        await page.locator('input#install_form_username').fill(username);
        await page.locator('input#install_form_email').fill(email);
        await page.locator('input#install_form_password').fill(test_secret);
        await page.locator('button#submit-btn').click();
        await wait(500);
        await page.locator('button#submit-btn').click();
        await page.locator('button.prev').click();
        await page.locator('button#submit-btn').click();
        await expect(page.locator('input#install_form_company_name')).toHaveCount(0);
        await expect(page.locator('input#install_form_company_url')).toHaveCount(0);
        await expect(page.locator('input#install_form_platform_name')).toHaveCount(0);
        await expect(page.locator('input#install_form_term_url')).toHaveCount(0);
        await expect(page.locator('input#install_form_policy_url')).toHaveCount(0);
        await expect(page.locator('div.ant-upload')).toHaveCount(0);
        await expect(page.locator('span.rc-color-picker-trigger')).toHaveCount(0);
        const form = page.locator('form#install_form');
        await expect(form).toBeVisible();
        await expect(form.locator('h4.ant-typography')).toHaveCount(1);
        await expect(form.locator('div.ant-alert')).toBeVisible();
        await expect(form.locator('div.ant-card-grid')).toHaveCount(17);
        await expect(form.locator('button.prev')).toBeVisible();
        await expect(form.locator('button#submit-btn')).toBeVisible();
    });

    test('should display success install page when submitting form with valid credentials (english version)', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const hex = 'ffffff';
        await install(page, username, email, test_secret, hex, 'first');
    });

    test('should display success install page when submitting form with valid credentials (arabic version)', async ({ page }) => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const hex = 'ffffff';
        await install(page, username, email, test_secret, hex, 'last');
    });
});

// Finish installer app

test.describe('Finish testing installer app', () => {
    test('should set completion state', async ({ database }) => {
        await removeUser('administrator', database);
    });
});
