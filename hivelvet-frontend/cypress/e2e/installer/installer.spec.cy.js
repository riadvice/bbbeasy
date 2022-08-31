describe('Test install process', () => {
    beforeEach(() => {
        cy.visit('/');
    });
    it('should load correctly install wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
        cy.get('div.ant-steps-item').should('be.visible').and('have.length', 3);
    });
    it('should load correctly and check step 1 form elements exist', () => {
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 1);
            cy.get('label').should('be.visible').and('have.length', 3);
            cy.get('input#install_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_password').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty step 1 form', () => {
        cy.get('input#install_form_username').should('have.value', '');
        cy.get('input#install_form_email').should('have.value', '');
        cy.get('input#install_form_password').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should validate step 1 form inputs inputs', () => {
        const username = 'usr';
        const email = 'email';
        const password = 'pwd';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should display errors when submitting step 1 form with existing credentials', () => {
        const username = 'administrator';
        const email = 'administrator@riadvice.tn';
        const password = 'hivelvet-administrator';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='administrator';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.visit('/');
                cy.get('input#install_form_username').type(username);
                cy.get('input#install_form_email').type(email);
                cy.get('input#install_form_password').type(password);
                cy.get('button#submit-btn').click();
                cy.wait(1000);
                cy.get('button#submit-btn').click();
                cy.wait(1000);
                cy.get('button#submit-btn').click();
                cy.wait(1000);
                cy.reload();
            }
            cy.get('input#install_form_username').type(username).should('have.value', username);
            cy.get('input#install_form_email').type(email).should('have.value', email);
            cy.get('input#install_form_password').type(password).should('have.value', password);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
        });
    });
    it('should load correctly and check step 2 form elements exist', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_username').should('not.exist');
        cy.get('input#install_form_email').should('not.exist');
        cy.get('input#install_form_password').should('not.exist');
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 2);
            cy.get('label').should('be.visible').and('have.length', 9);
            cy.get('input#install_form_company_name').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_company_url').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_platform_name').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_term_url').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_policy_url').should('be.visible').and('have.length', 1);
            cy.get('div.ant-upload').should('be.visible').and('have.length', 1);
            cy.get('span.rc-color-picker-trigger').should('be.visible').and('have.length', 4);
            cy.get('button.prev').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty step 2 form', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_name').clear().should('have.value', '');
        cy.get('input#install_form_company_url').clear().should('have.value', '');
        cy.get('input#install_form_platform_name').clear().should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should validate step 2 form inputs', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        const url = 'url';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_url').clear().type(url).should('have.value', url);
        cy.get('input#install_form_term_url').clear().type(url).should('have.value', url);
        cy.get('input#install_form_policy_url').clear().type(url).should('have.value', url);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should load correctly and check step 3 form elements exist', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_name').should('not.exist');
        cy.get('input#install_form_company_url').should('not.exist');
        cy.get('input#install_form_platform_name').should('not.exist');
        cy.get('input#install_form_term_url').should('not.exist');
        cy.get('input#install_form_policy_url').should('not.exist');
        cy.get('div.ant-upload').should('not.exist');
        cy.get('span.rc-color-picker-trigger').should('not.exist');
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 1);
            cy.get('div.ant-alert').should('be.visible').and('have.length', 1);
            cy.get('div.ant-card-grid').should('be.visible').and('have.length', 17);
            cy.get('button.prev').should('be.visible');
            cy.get('button#submit-btn').should('be.visible');
        });
    });
    it('should revert from step 3 to step 1', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('button.prev').click();
        cy.wait(1000);
        cy.get('button.prev').click();
    });
    it('should display success install page when submitting form with valid credentials', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('input[type=file]').selectFile({ contents: 'cypress/fixtures/example.json', fileName: 'file.png' }, { force: true })
        cy.wait(1000);
        cy.get('div.ant-upload-list-item').should('be.visible').and('have.length', 1);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.ant-result-icon').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='test');` });
        cy.task('database', { sql: `DELETE FROM public.users WHERE username='test';` });
    });
});
