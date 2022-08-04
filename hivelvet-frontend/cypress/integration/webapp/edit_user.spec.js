describe('Test edit user form', () => {
    beforeEach(() => {
        cy.beforeEach('users', 'edit')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('users', 'edit')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('users', 'edit')
    })

    it('should display errors when submitting form with existing credentials', () => {
        cy.checkSubmittedForm('users', 'edit')
    })
})
