describe('Test add user process', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='Professor';` });
            }
            cy.login(email, password);
            cy.visit('/settings/users');
            cy.get('button#add-user-btn').click();
        });
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#users_form').should('exist').within(() => {
            cy.get('label.ant-form-item-required').should('be.visible').and('have.length', 4);
            cy.get('input#users_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#users_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#users_form_password').should('be.visible').and('have.length', 1);
            cy.get('input#users_form_role').should('be.visible').and('have.length', 1);
        });
        cy.get('button.cancel-btn').should('be.visible').and('have.length', 1);
        cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#users_form_username').should('have.value', '');
        cy.get('input#users_form_email').should('have.value', '');
        cy.get('input#users_form_password').should('have.value', '');
        cy.get('input#users_form_role').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 4);
    });
    it('should validate form inputs', () => {
        const username = 'usr';
        const email = 'email';
        const password = 'pwd';
        cy.get('input#users_form_username').type(username).should('have.value', username);
        cy.get('input#users_form_email').type(email).should('have.value', email);
        cy.get('input#users_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 4);
    });
    it('should display errors when submitting form with existing credentials', () => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn'
        const password = 'professor';
        const rolename = 'lecturer';
        cy.get('input#users_form_username').type(username).should('have.value', username);
        cy.get('input#users_form_email').type(email).should('have.value', email);
        cy.get('input#users_form_password').type(password).should('have.value', password);
        cy.get('input#users_form_role').click();
        cy.get('div.ant-select-item-option-content').each(($role) => {
            if ($role.text() == rolename) {
                cy.wrap($role).click();
            }
        });
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
    });
});
