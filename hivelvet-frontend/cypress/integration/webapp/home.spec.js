describe('Test render of home page', () => {
    it('should render to login page if user is not logged in', () => {
        cy.visit('/home')
        cy.location('pathname').should('eq', '/login')
    })

    it('should render to login page if user has logged out', () => {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='riadvice';`
        }).then((result) => {
            if (result.length == 0) {
                cy.register('riadvice', 'test@riadvice.tn', 'pass', 'pass')
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='riadvice';`
            }).then(() => {
                cy.login('test@riadvice.tn', 'pass')
                cy.get('button.profil-btn').click()
                cy.get('a#logout-btn').click()
                cy.wait(1000)
                cy.location('pathname').should('eq', '/login')
            })
        })
    })
})
