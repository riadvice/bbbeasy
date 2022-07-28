describe('Test add user form', () => {
    beforeEach(() => {
        cy.login('mohamedamine.benfredj1@esprit.tn', '203JMT2988')
        cy.visit('/settings/users')
        cy.get('button#add_user-btn').click()
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('users')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('users')
    })

    it('should display errors when submitting form with invalid credentials', () => {
        const pwd = 'password';
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
