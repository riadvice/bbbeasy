describe('Test add role process', () => {
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
            cy.visit('/settings/roles');
            cy.get('button#add-role-btn').click();
        });
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#roles_form').should('be.visible').within(() => {
            cy.get('label.ant-form-item-required').should('be.visible').and('have.length', 1);
            cy.get('input#roles_form_name').should('be.visible').and('have.length', 1);
            cy.get('div.ant-card').should('be.visible').and('have.length', 4);
            cy.get('button.cancel-btn').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#roles_form_name').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with existing rolename', () => {
        cy.task('database', {
            sql: `SELECT name FROM public.roles;`
        }).then((result) => {
            if (result.rows.length != 0) {
                cy.get('input#roles_form_name').type(result.rows[0].name).should('have.value', result.rows[0].name);
            }
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
        });
    });
});
