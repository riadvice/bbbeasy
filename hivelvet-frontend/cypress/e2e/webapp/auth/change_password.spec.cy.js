describe('Test change password process if token valid', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.task('database', {
                sql: `SELECT token FROM public.reset_password_tokens ORDER BY expires_at DESC;`
            }).then((response) => {
                cy.visit('/change-password?token='.concat(response.rows[0].token));
            });
        });
    });
    it('should load correctly change password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#change_form').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 2);
            cy.get('input#change_form_password').should('be.visible').and('have.length', 1);
            cy.get('input#change_form_confirmPassword').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#change_form_password').should('have.value', '');
        cy.get('input#change_form_confirmPassword').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should validate form inputs', () => {
        const password = 'pwd';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should check for passwords matching', () => {
        const password = 'password';
        const confirmPassword = 'confirmPassword';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(confirmPassword).should('have.value', confirmPassword);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should render to login page if form valid', () => {
        const password = 'password';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('a.ant-btn-primary').click();
        cy.location('pathname').should('eq', '/login');
    });
    it('should fix login problems by reverting to previous password', () => {
        const password = 'professor';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
    });
});
describe('Test change password process if token expired', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.task('database', {
                sql: `SELECT token FROM public.reset_password_tokens ORDER BY expires_at DESC;`
            }).then((response) => {
                cy.wait(900000);
                cy.visit('/change-password?token='.concat(response.rows[10].token));
            });
        });
    });
    it('should render to invalid password reset token page', () => {
        cy.get('div.ant-form-item-label').should('not.exist');
        cy.get('input#change_form_password').should('not.exist');
        cy.get('input#change_form_confirmPassword').should('not.exist');
        cy.get('button#submit-btn').should('not.exist');
        cy.get('div.ant-result-image').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('a.ant-btn.color-blue').should('be.visible').and('have.length', 1);
    });
});
