describe('Test login process', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.visit('/register');
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='Professor';` });
            }
            cy.visit('/login');
        });
    });
    it('should load correctly login wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#login_form').should('exist').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 2);
            cy.get('input#login_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#login_form_password').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#login_form_email').should('have.value', '');
        cy.get('input#login_form_password').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should validate form inputs', () => {
        const email = 'email';
        const password = 'pwd';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should display errors when submitting form with invalid credentials', () => {
        const email = 'test@riadvice.tn';
        const password = 'password';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.alert-error-msg').should('be.visible').and('have.length', 1);
    });
});
