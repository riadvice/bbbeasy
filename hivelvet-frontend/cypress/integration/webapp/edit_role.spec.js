describe('Test edit role form', () => {
    beforeEach(() => {
        cy.beforeEach('roles', 'edit')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('roles', 'edit')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('roles', 'edit')
    })
})
