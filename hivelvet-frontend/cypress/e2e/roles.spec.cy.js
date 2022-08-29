describe('Test roles component', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='Professor';` }).then((response) => {
            if (response.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='Professor';` });
            }
            cy.login(email, password);
            cy.visit('/settings/roles');
        });
    });
    it('should display roles paginated list', () => {
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length);
        });
    });
    it('should add new role', () => {
        const rolename = 'tutor';
        cy.task('database', { sql: `SELECT * FROM public.roles WHERE name='tutor';` }).then((response) => {
            if (response.rows.length != 0) {
                cy.get('button#add-role-btn').click();
                cy.get('button.cancel-btn').click();
                cy.task('database', { sql: `DELETE FROM public.roles WHERE name='tutor';` });
                cy.reload();
            }
            cy.addRole(rolename);
            cy.get('div.ant-notification-notice-success').should('have.length', 1);
        });
    });
    it('should display errors when submitting empty edit form', () => {
        const rolename = 'tutor';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
        });
        cy.get('input#name').clear().should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('have.length', 1);
    });    
    it('should set role permissions', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
            cy.wait(1000);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children().each(($div) => {
            $div.children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click()
        });
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-notification-notice-success').should('have.length', 1);
    });
    it('should show cancel confirmation when editing role', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
            cy.wait(1000);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.get('input.ant-checkbox-input').should('have.length', 0);
    });
    it('should not make changes on role', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
        });
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-notification-notice-info').should('have.length', 1);
    });





























    // it('should display roles list', () => {
    //     cy.task('database', {
    //         sql: `SELECT * FROM public.roles;`
    //     }).then((result) => {
    //         cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
    //     });
    // });
    // it('should load correctly and check add role form elements exist', () => {
    //     cy.get('button#add-role-btn').click();
    //     cy.get('form#roles_form').should('be.visible').within(() => {
    //         cy.get('label.ant-form-item-required').should('be.visible').and('have.length', 1);
    //         cy.get('input#roles_form_name').should('be.visible').and('have.length', 1);
    //         cy.get('div.ant-card').should('be.visible').and('have.length', 4);
    //         cy.get('button.cancel-btn').should('be.visible').and('have.length', 1);
    //         cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
    //     });
    // });
    // it('should display errors when submitting empty add role form', () => {
    //     cy.get('button#add-role-btn').click();
    //     cy.get('input#roles_form_name').should('have.value', '');
    //     cy.get('button#submit-btn').click();
    //     cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    // });
    // it('should display errors when submitting add role form with existing rolename', () => {
    //     cy.get('button#add-role-btn').click();
    //     cy.task('database', {
    //         sql: `SELECT name FROM public.roles;`
    //     }).then((result) => {
    //         if (result.rows.length != 0) {
    //             cy.get('input#roles_form_name').type(result.rows[0].name).should('have.value', result.rows[0].name);
    //         }
    //         cy.get('button#submit-btn').click();
    //         cy.wait(1000);
    //         cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    //     });
    // });
    // it('should display users list when submitting add role form with valid rolename', () => {
    //     const rolename = 'professor';
    //     cy.task('database', {
    //         sql: `SELECT * FROM public.roles;`
    //     }).then((result) => {
    //         cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
    //         cy.task('database', {
    //             sql: `SELECT * FROM public.roles WHERE name='professor';`
    //         }).then(() => {
    //             cy.get('button#add-role-btn').click();
    //             cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    //             cy.get('button#submit-btn').click();
    //             cy.wait(1000);
    //             cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length + 1);
    //             cy.task('database', { sql: `DELETE FROM public.roles WHERE name='professor';` })
    //         });
    //     });
    // });
    // it('should load correctly and check form elements exist', () => {
    //     cy.task('database', {
    //         sql: `SELECT * FROM public.roles WHERE name='professor';`
    //     }).then((response) => {
    //         const rolename = 'professor';
    //         if (response.rows.length == 0) {
    //             cy.get('button#add-role-btn').click();
    //             cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    //             cy.get('button#submit-btn').click();
    //             cy.wait(1000);
    //         }
    //         cy.contains(capitalize(rolename)).trigger('mouseover').parents('tr').find('button#edit-role-btn').click();
    //     });
    //     cy.get('input#name').should('be.visible').and('have.length', 1);
    //     cy.get('button.cell-input-cancel').should('be.visible').and('have.length', 1);
    //     cy.get('button.cell-input-save').should('be.visible').and('have.length', 1);
    // });
    // it('should display errors when submitting add role empty form', () => {
    //     cy.task('database', {
    //         sql: `SELECT * FROM public.roles WHERE name='professor';`
    //     }).then((response) => {
    //         const rolename = 'professor';
    //         if (response.rows.length == 0) {
    //             cy.get('button#add-role-btn').click();
    //             cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    //             cy.get('button#submit-btn').click();
    //             cy.wait(1000);
    //         }
    //         cy.contains(capitalize(rolename)).trigger('mouseover').parents('tr').find('button#edit-role-btn').click();
    //     });
    //     cy.get('input#name').clear().should('have.value', '');
    //     cy.get('button.cell-input-save').click();
    //     cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    // });
    // it('should delete new added role', () => {
    //     const rolename = 'professor';
    //     cy.task('database', {
    //         sql: `SELECT * FROM public.roles;`
    //     }).then((result) => {
    //         cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
    //         cy.task('database', {
    //             sql: `SELECT * FROM public.roles WHERE name='professor';`
    //         }).then((response) => {
    //             if (response.rows.length == 0) {
    //                 cy.get('button#add-role-btn').click();
    //                 cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    //                 cy.get('button#submit-btn').click();
    //                 cy.wait(1000);
    //                 result.rows.length = ++result.rows.length;
    //                 cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length);
    //             }
    //             cy.contains(capitalize(rolename)).parents('tr').find('a.ant-typography:last').click();
    //             cy.get('div.ant-popover-buttons').children('button:last').click();
    //             cy.wait(1000);
    //             cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length - 1);
    //         });
    //     });
    // });
});
