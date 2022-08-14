describe('Test delete role process', () => {
    function initcap(word) { return word.charAt(0).toUpperCase() + word.slice(1); }
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
        });
    });
    it('should delete new added role', () => {
        const rolename = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.roles;`
        }).then((result) => {
            cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
            cy.task('database', {
                sql: `SELECT * FROM public.roles WHERE name='professor';`
            }).then((response) => {
                if (response.rows.length == 0) {
                    cy.get('button#add-role-btn').click();
                    cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
                    cy.get('button#submit-btn').click();
                    cy.wait(1000);
                    result.rows.length = ++result.rows.length;
                    cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
                }
                cy.contains(initcap(rolename)).parents('tr').find('a.ant-typography:last').click();
                cy.get('div.ant-popover-buttons').children('button:last').click();
                cy.wait(1000);
                cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length - 1);
            });
        });
    });
});
