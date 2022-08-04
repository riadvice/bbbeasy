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
        cy.checkSubmittedForm('login')
    })
})
