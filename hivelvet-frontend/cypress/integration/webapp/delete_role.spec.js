describe('Test delete role form', () => {
    beforeEach(() => {
        cy.beforeEach('roles')
    })

    it('should delete new added role', () => {
        const role = 'professor';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.roles;`
        }).then((result) => {
            if (result.rows.length != 0) {
                cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length)
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT * FROM public.roles WHERE name='professor';`
                }).then((response) => {
                    if (response.rows.length == 0) {
                        cy.get('input#roles_form_name').type(role).should('have.value', role)
                        cy.get('button#submit-btn').click()
                        cy.wait(1000)
                        result.rows.length = ++ result.rows.length
                        cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length)
                    }
                    cy.contains(role.charAt(0).toUpperCase() + role.slice(1)).parents('tr').find('div.ant-space-item').children('a').last().click()
                    cy.get('button.ant-btn.ant-btn-primary.ant-btn-sm').click()
                    cy.wait(1000)
                    cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length - 1)
                })
            }
        })
    })
})
