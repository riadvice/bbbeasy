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

    it('should display errors when submitting form with invalid credentials', () => {
        const pwd = 'password';
        const confirmPwd = 'password';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT username, email FROM public.users;`
        }).then((result) => {
            if(result.length != 0) {
                cy.get('input#register_form_username').type(result.rows[0].username).should('have.value', result.rows[0].username)
                cy.get('input#register_form_email').type(result.rows[0].email).should('have.value', result.rows[0].email)
                cy.get('input#register_form_password').type(pwd).should('have.value', pwd)
                cy.get('input#register_form_confirmPassword').type(confirmPwd).should('have.value', confirmPwd)
                cy.get('input#register_form_agreement').check()
                cy.get('button#submit-btn').click()
                cy.wait(1000)
                cy.get('div.alert-msg').should('be.visible')
            }
        })
    })
})
