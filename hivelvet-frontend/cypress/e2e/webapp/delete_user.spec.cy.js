describe('Test delete user form', () => {
    beforeEach(() => {
        cy.beforeEach('users')
    })

    it('should delete new added user', () => {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'lecturer';
        const role ='lecturer';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users;`
        }).then((result) => {
            if (result.rows.length != 0) {
                cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length)
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT * FROM public.users WHERE username='Lecturer';`
                }).then((response) => {
                    if (response.rows.length == 0) {
                        cy.get('input#users_form_username').type(username).should('have.value', username)
                        cy.get('input#users_form_email').type(email).should('have.value', email)
                        cy.get('input#users_form_password').type(pwd).should('have.value', pwd)
                        cy.get('input#users_form_role').click()
                        cy.get('div.ant-select-item-option-content').each(($element) => {
                            if ($element.text() == role) {
                                cy.wrap($element).click()
                            }
                            cy.get('button#submit-btn').click()
                            cy.wait(1000)
                            result.rows.length = ++ result.rows.length
                            cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length) 
                        })
                    }
                    cy.contains(email).parents('tr').find('div.ant-space-item').children('a').last().click()
                    cy.get('button.ant-btn.ant-btn-primary.ant-btn-sm').click()
                    cy.wait(1000)
                    cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length - 1)
                })
            }
        })
    })
})
