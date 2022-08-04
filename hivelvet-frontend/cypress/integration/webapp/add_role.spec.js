describe('Test add role form', () => {
    beforeEach(() => {
        cy.beforeEach('roles', 'add')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('roles', 'add')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('roles', 'add') 
    })

    it('should display errors when submitting form with existing rolename', () => {
        cy.checkSubmittedForm('roles', 'add')
    })
})
