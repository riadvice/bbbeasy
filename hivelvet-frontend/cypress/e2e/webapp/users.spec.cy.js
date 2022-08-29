describe('Test users component', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='Professor';` }).then((response) => {
            if (response.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='Professor';` });
            }
            cy.login(email, password);
            cy.visit('/settings/users');
        });
    });
    it('should display users paginated list', () => {
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length);
        });
    });
    it('should add new user', () => {
        const username = 'lecturer';
        const email = 'lecturer@riadvice.tn';
        const password = 'lecturer';
        const color = '-warning';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='lecturer';` }).then((response) => {
            if (response.rows.length != 0) {
                cy.get('button#add-user-btn').click();
                cy.get('button.cancel-btn').click();
                cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='lecturer');` });
                cy.task('database', { sql: `DELETE FROM public.users WHERE username='lecturer';` });
                cy.reload();
            }
            cy.addUser(username, email, password);
            cy.task('database', { sql: `SELECT * FROM public.users;` }).then((result) => {
                cy.findInPage(result.rows.length, email, null, color);
            });
            cy.get('div.ant-notification-notice-success').should('have.length', 1);
        });
    });
    it('should display errors when submitting empty edit form', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('input#username').clear().should('have.value', '');
        cy.get('input#email').clear().should('have.value', '');
        cy.get('span.ant-select-selection-item').click({ multiple: true }).get('span.ant-select-clear').click({ multiple: true });
        cy.get('input#role').should('have.value', '');
        cy.get('input#status').should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('have.length', 4);
    });
    it('should validate edit user form inputs', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('input#username').clear().type('usr').should('have.value', 'usr');
        cy.get('input#email').clear().type('email').should('have.value', 'email');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('have.length', 2);
    });
    it('should display errors when submitting add user form with existing credentials', () => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.addUser(username, email, password);
        cy.get('div.alert-msg').should('have.length', 1);
    });
    it('should set user status to active', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-success';
        const status = 'active';
        cy.setUserStatus(email, action, color, status);
    });
    it('should set user status to inactive', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-default';
        const status = 'inactive';
        cy.setUserStatus(email, action, color, status);
    });
    it('should set user status to banned', () => {
        const email = 'lecturer@riadvice.tn';
        const color = '';
        cy.task('database', { sql: `UPDATE public.users SET status = 'banned' WHERE username = 'lecturer';` });
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, null, color);
        });
    });
    it('should show cancel confirmation when editing user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('span.ant-select-selection-item').click({ multiple: true }).get('span.ant-select-clear').click({ multiple: true });
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.get('input#username').should('not.exist');
        cy.get('input#email').should('not.exist');
        cy.get('input#role').should('not.exist');
        cy.get('input#status').should('not.exist');
    });
    it('should not make changes on user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-cancel').click();
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-save').click();
        cy.wait(1000);
        cy.get('div.ant-notification-notice-info').should('have.length', 1);
    });
    it('should delete user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        const color = '-error';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.wait(1000);
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, null, color);
        });
        cy.get('div.ant-notification-notice-success').should('have.length', 1);
    });
    it('should not delete user already deleted', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.wait(1000);
        cy.get('div.ant-notification-notice-info').should('have.length', 1);
    });
});
