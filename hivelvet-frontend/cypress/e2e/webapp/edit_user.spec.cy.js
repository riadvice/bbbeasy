describe('Test edit user process', () => {
    function initcap(word) { return word.charAt(0).toUpperCase() + word.slice(1); };
    const rolename = 'lecturer';
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            };
            cy.task('database', {
                sql: `UPDATE public.users SET status='active' WHERE username='Professor';`
            }).then(() => {
                cy.login(email, password);
                cy.visit('/settings/users');
                cy.task('database', {
                    sql: `SELECT * FROM public.users WHERE username='Lecturer';`
                }).then((response) => {
                    const username = 'Lecturer';
                    const email = 'lecturer@riadvice.tn';
                    const password = 'lecturer';
                    if (response.rows.length == 0) {
                        cy.get('button#add-user-btn').click();
                        cy.get('input#users_form_username').type(username).should('have.value', username);
                        cy.get('input#users_form_email').type(email).should('have.value', email);
                        cy.get('input#users_form_password').type(password).should('have.value', password);
                        cy.get('input#users_form_role').click();
                        cy.get('div.ant-select-item-option-content').each(($role) => {
                            if ($role.text() == rolename) {
                                cy.wrap($role).click();
                            };
                        });
                        cy.get('button#submit-btn').click();
                        cy.wait(1000);
                    };
                    cy.contains(email).parents('tr').find('a.ant-typography:first').click();
                });
            });
        });
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('input#username').should('be.visible').and('have.length', 1);
        cy.get('input#email').should('be.visible').and('have.length', 1);
        cy.get('input#role').should('be.visible').and('have.length', 1);
        cy.get('input#status').should('be.visible').and('have.length', 1);
        cy.get('button.cell-input-cancel').should('be.visible').and('have.length', 1);
        cy.get('button.cell-input-save').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#username').clear().should('have.value', '');
        cy.get('input#email').clear().should('have.value', '');
        cy.get('span.ant-select-selection-item').click({ multiple: true }).get('span.ant-select-clear').click({ multiple: true });
        cy.get('input#role').should('have.value', '');
        cy.get('input#status').should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 4);
    });
    it('should display errors when submitting form with invalid credentials', () => {
        const username = 'usr';
        const email = 'email';
        cy.get('input#username').clear().type(username).should('have.value', username);
        cy.get('input#email').clear().type(email).should('have.value', email);
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
});
