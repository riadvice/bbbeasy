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
        cy.checkSubmittedForm('reset')
    })
})
