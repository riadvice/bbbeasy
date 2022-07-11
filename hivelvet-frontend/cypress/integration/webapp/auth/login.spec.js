describe('Test login form', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('login')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('login')
    })

    it('should check for email type and password length', () => {
        cy.checkInvalidForm('login')
    })

    it('should display errors when submitting form with invalid credentials', () => {
        const fakeEmail = 'test@gmail.com'
        const fakePwd = 'password'

        cy.get('input#login_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('input#login_form_password').type(fakePwd).should('have.value', fakePwd)
        cy.get('button#submit-btn').click()

        cy.wait(1000)
        cy.get('div.alert-error-msg').should('be.visible')
    })
})
