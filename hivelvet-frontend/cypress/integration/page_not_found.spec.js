describe('Test render of not found page', () => {
    it('should redirect to not found page if route not exist', () => {
        cy.visit('/xxx')
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')
        cy.get('div.page-not-found').should('exist')
    })
})