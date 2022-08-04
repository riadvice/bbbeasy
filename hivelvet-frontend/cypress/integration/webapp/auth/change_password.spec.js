describe('Test change password form', () => {
    beforeEach(() => {
        cy.beforeEach('reset')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('change')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('change')
    })

    it('should check for passwords length', () => {
        cy.checkInvalidForm('change')
    })

    it('should check for passwords matching', () => {
        cy.checkPasswordFields('change')
    })

    it('should render to login page if form is valid', () => {
        cy.changePassword('password')
    })

    it('should revert to previous password in order to fix login problems', () => {
        cy.changePassword('professor')
    })
})
