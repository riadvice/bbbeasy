describe('Test reset password process', () => {
    beforeEach(() => {
        cy.visit('/reset-password');
    });
    it('should load correctly reset password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#reset_form').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 1);
            cy.get('input#reset_form_email').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#reset_form_email').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should validate form input', () => {
        const email = 'email';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with invalid credential', () => {
        const email = 'test@riadvice.tn';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
    });
});
