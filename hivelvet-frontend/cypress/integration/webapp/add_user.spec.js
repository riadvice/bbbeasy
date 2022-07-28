describe('Test add user form', () => {
    beforeEach(() => {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='riadvice';`
        }).then((result) => {
            if (result.length == 0) {
                cy.register('riadvice', 'test@riadvice.tn', 'pass', 'pass')
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='riadvice';`
            }).then(() => {
                cy.login('test@riadvice.tn', 'pass')
                cy.visit('/settings/users')
                cy.get('button#add-user-btn').click()
            })
        })
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('users')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('users')
    })

    it('should display errors when submitting form with invalid credentials', () => {
        const pwd = 'pass';
        const role = 'lecturer';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT username, email FROM public.users;`
        }).then((result) => {
            if(result.length != 0) {
                cy.get('input#users_form_username').type(result.rows[0].username).should('have.value', result.rows[0].username)
                cy.get('input#users_form_email').type(result.rows[0].email).should('have.value', result.rows[0].email)
                cy.get('input#users_form_password').type(pwd).should('have.value', pwd)
                cy.get('input#users_form_role').click() 
                cy.get('div.ant-select-item-option-content').each(($element) => {
                    if ($element.text() == role) {
                        cy.wrap($element).click()
                        cy.get('button#submit-btn').click()
                        cy.wait(1000)
                        cy.get('div.alert-msg').should('be.visible')
                    }
                })
            }
        })
    })
})
