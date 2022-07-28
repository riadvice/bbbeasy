describe('Test render of home page', () => {
    it('should render to login page if user is not logged in', () => {
        cy.visit('/home')
        cy.location('pathname').should('eq', '/login')
    })

    it('should render to login page if user has logged out', () => {
        cy.login('mohamedamine.benfredj1@esprit.tn', '203JMT2988')
        cy.get('button.profil-btn').click()
        cy.get('a#logout-btn').click()
        cy.wait(1000)
        cy.location('pathname').should('eq', '/login')
    })
})