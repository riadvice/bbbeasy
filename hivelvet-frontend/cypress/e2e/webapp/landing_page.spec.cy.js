describe('Test landing page render', () => {
    it('should load correctly landing wizard page', () => {
        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
        cy.get('div.landing-content').should('be.visible');
        cy.get('a.login-btn').should('be.visible');
        cy.get('a.register-btn').should('be.visible');
        cy.get('div.features').should('be.visible');
    });
});
