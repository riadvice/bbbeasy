describe('Test register process', () => {
    beforeEach(() => {
        cy.visit('/register');
    });
    it('should load correctly register wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#register_form').should('exist').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 4);
            cy.get('input#register_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_password').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_confirmPassword').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_agreement').should('exist').and('have.length', 1);
            cy.get('label.ant-checkbox-wrapper').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#register_form_username').should('have.value', '');
        cy.get('input#register_form_email').should('have.value', '');
        cy.get('input#register_form_password').should('have.value', '');
        cy.get('input#register_form_confirmPassword').should('have.value', '');
        cy.get('input#register_form_agreement').should('not.be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 5);
    });
    it('should validate form inputs', () => {
        const username = 'usr';
        const email = 'email';
        const password = 'pwd';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(password).should('have.value', password);
        cy.get('input#register_form_agreement').should('not.be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 5);
    });
    it('should check for passwords matching', () => {
        const username = 'Test';
        const email = 'test@riadvice.tn';
        const password = 'password';
        const confirmPassword = 'confirmPassword';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(confirmPassword).should('have.value', confirmPassword);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with existing credentials', () => {
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
            cy.get('input#register_form_username').type(username).should('have.value', username);
            cy.get('input#register_form_email').type(email).should('have.value', email);
            cy.get('input#register_form_password').type(password).should('have.value', password);
            cy.get('input#register_form_confirmPassword').type(password).should('have.value', password);
            cy.get('input#register_form_agreement').click().should('be.checked');
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
        });
    });
    it('should render to success register page when submitting form with valid credentials', () => {
        const username = 'Test';
        const email = 'test@riadvice.tn';
        const password = 'password';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(password).should('have.value', password);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.ant-result-icon').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-extra').should('be.visible').and('have.length', 1);
        cy.task('database', { sql: `DELETE FROM public.users WHERE username='Test';` });
    });
});
