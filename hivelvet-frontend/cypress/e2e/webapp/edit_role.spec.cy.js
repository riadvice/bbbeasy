describe('Test edit role process', () => {
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
            cy.task('database', {
                sql: `SELECT * FROM public.roles WHERE name='professor';`
            }).then((response) => {
                const rolename = 'professor';
                if (response.rows.length == 0) {
                    cy.get('button#add-role-btn').click();
                    cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
                    cy.get('button#submit-btn').click();
                    cy.wait(1000);
                }
                cy.contains(initcap(rolename)).trigger('mouseover').parents('tr').find('button#edit-role-btn').click();
            });
        });
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('input#name').should('be.visible').and('have.length', 1);
        cy.get('button.cell-input-cancel').should('be.visible').and('have.length', 1);
        cy.get('button.cell-input-save').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#name').clear().should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
});
