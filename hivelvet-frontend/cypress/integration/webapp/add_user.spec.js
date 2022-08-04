describe('Test add user form', () => {
    beforeEach(() => {
        cy.beforeEach('users', 'add')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('users', 'add')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('users', 'add')
    })

    it('should check for username length, email type and passwords length', () => {
        cy.checkInvalidForm('users')
    })

    it('should display errors when submitting form with existing credentials', () => {
        cy.checkSubmittedForm('users', 'add')
    })
})
