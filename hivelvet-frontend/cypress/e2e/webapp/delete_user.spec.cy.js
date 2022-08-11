describe('Test delete user process', () => {
    const username = 'Professor';
    const email = 'professor@riadvice.tn';
    const password = 'professor';
    const rolename = 'lecturer';
    before(() => {
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
            });
        });
    });
    it('should delete new added user', () => {
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
            } else if (response.rows[0].status != 'deleted') {
                cy.contains(email).parents('tr').find('a.ant-typography:last').click();
                cy.get('div.ant-popover-buttons').children('button:last').click();
                cy.wait(1000);
            };
            cy.contains(email).parents('tr').find('span.ant-tag-error').should('be.visible').and('have.length', 1);
        });
    });
});
