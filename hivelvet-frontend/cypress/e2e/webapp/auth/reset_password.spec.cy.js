describe('Test reset password process', () => {
    beforeEach(() => {
        cy.visit('/reset-password');
    });
    it('should load correctly reset password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#reset_form').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 1);
            cy.get('input#reset_form_email').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#reset_form_email').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should validate form input', () => {
        const email = 'email';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with invalid credential', () => {
        const email = 'test@riadvice.tn';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
    });
    it('should display success notification when submitting form with existing email', () => {
        const username = 'Test';
        const email = 'test@riadvice.tn';
        const password = 'password';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Test';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.ant-notification').should('be.visible').and('have.length', 1);
            cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='Test');` });
            cy.task('database', { sql: `DELETE FROM public.users WHERE username='Test';` });
        });
    });
});
