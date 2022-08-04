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
        cy.checkPasswordFields('register')
    })

    it('should display errors when submitting form with existing credentials', () => {
        cy.checkSubmittedForm('register')
    })
})
