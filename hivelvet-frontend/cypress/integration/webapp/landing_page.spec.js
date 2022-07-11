//group tests which fit together
describe('Test render of landing page', () => {
    it('should loads correctly', () => {
        //ARRANGE
        cy.visit('/')

        // ASSERT
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')
        cy.get('div.landing-content').should('exist')
        cy.get('a.login-btn').should('exist')
        cy.get('a.register-btn').should('exist')
        cy.get('div.features').should('exist')
    })
})