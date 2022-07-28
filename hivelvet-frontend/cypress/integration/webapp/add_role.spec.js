describe('Test add role form', () => {
    beforeEach(() => {
        cy.login('mohamedamine.benfredj1@esprit.tn', '203JMT2988')
        cy.visit('/settings/roles')
        cy.get('button#add_role-btn').click()
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('roles')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('roles')
    })

    it('should display errors when submitting form with invalid name', () => {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT name FROM public.roles;`
        }).then((result) => {
            if(result.length != 0) {
                cy.get('input#roles_form_name').type(result.rows[0].name).should('have.value', result.rows[0].name)
                cy.get('button#submit-btn').click()
                cy.get('input#roles_form_name').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible'); 
            }
        })
    })
})
