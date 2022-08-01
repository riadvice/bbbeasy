describe('Test add user form', () => {
    beforeEach(() => {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Lecturer';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register('Lecturer', 'lecturer@riadvice.tn', 'password', 'password')
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='Lecturer';`
            }).then(() => {
                cy.login('lecturer@riadvice.tn', 'password')
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

    it('should display errors when submitting form with existing credentials', () => {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'password';
        const role = 'lecturer';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Lecturer';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, pwd, pwd)
            }
            cy.get('input#users_form_username').type(result.rows[0].username).should('have.value', username)
            cy.get('input#users_form_email').type(result.rows[0].email).should('have.value', email)
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
        })
    })
})
