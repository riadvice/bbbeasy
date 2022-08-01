describe('Test register form', () => {

    beforeEach(() => {
        cy.visit('/register')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('register')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('register')
    })

    it('should check for username length, email type and passwords length', () => {
        cy.checkInvalidForm('register')
    })

    it('should check for passwords matching', () => {
        const fakePwd1 = 'test1'
        const fakePwd2 = 'test2'

        cy.get('input#register_form_password').type(fakePwd1).should('have.value', fakePwd1)
        cy.get('input#register_form_confirmPassword').type(fakePwd2).should('have.value', fakePwd2)
        cy.get('button#submit-btn').click()

        cy.get('input#register_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    })

    it('should display errors when submitting form with existing credentials', () => {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'password';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Lecturer';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, pwd, pwd)
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='Lecturer';`
            }).then(() => {
                cy.register(username, email, pwd, pwd)
                cy.get('div.alert-msg').should('be.visible')
            })
        })
    })
})
