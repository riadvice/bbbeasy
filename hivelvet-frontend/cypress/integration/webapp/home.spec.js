describe('Test render of home page', () => {
    const username = 'Lecturer';
    const email = 'lecturer@riadvice.tn'
    const pwd = 'password';
    it('should render to login page if user is not logged in', () => {
        cy.visit('/home')
        cy.location('pathname').should('eq', '/login')
    })

    it('should render to login page if user has logged out', () => {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Lecturer';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, pwd, pwd)
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='Lecturer';`
            }).then(() => {
                cy.login(email, pwd)
                cy.get('button.profil-btn').click()
                cy.get('a#logout-btn').click()
                cy.wait(1000)
                cy.location('pathname').should('eq', '/login')
            })
        })
    })
})
