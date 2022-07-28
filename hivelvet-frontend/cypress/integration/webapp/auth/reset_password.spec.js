describe('Test reset password form', () => {
    beforeEach(() => {
        cy.visit('/reset-password')
    })

    it('should loads correctly and check input field exists', () => {
        cy.checkExistFormFields('reset')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('reset')
    })

    it('should check for email type', () => {
        cy.checkInvalidForm('reset')
    })

    it('should display errors when submitting form with invalid email', () => {
        const fakeEmail = 'test@gmail.com'
        cy.get('input').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('button.login-form-button').click()
        cy.wait(1000)
        cy.get('div.alert-msg').should('be.visible')
    })
})
