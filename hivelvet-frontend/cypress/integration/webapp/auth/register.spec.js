describe('Test register form', () => {

    beforeEach(() => {
        cy.visit('/register')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.get('form#register_form').should('exist').within(() => {
            cy.get('input#register_form_username').should('be.visible')
            cy.get('input#register_form_email').should('be.visible')
            cy.get('input#register_form_password').should('be.visible')
            cy.get('input#register_form_confirmPassword').should('be.visible')
            cy.get('input#register_form_agreement').should('not.be.checked')
            cy.get('button#submit-btn').should('be.visible')
        })
    })

    it('should display errors when submitting empty form', () => {
        cy.get('button#submit-btn').click()

        cy.get('form#register_form').children('.ant-form-item').get('.ant-form-item-has-error').should('be.visible')
    })

    it('should check for username length, email type and passwords length', () => {
        const shortUsername = 'abc'
        const invalidEmail = 'test'
        const shortPwd = 'pas'

        cy.get('input#register_form_username').type(shortUsername).should('have.value', shortUsername)
        cy.get('input#register_form_email').type(invalidEmail).should('have.value', invalidEmail)
        cy.get('input#register_form_password').type(shortPwd).should('have.value', shortPwd)
        cy.get('input#register_form_confirmPassword').type(shortPwd).should('have.value', shortPwd)
        cy.get('input#register_form_agreement').check()
        cy.get('button#submit-btn').click()

        cy.get('input#register_form_username').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
        cy.get('input#register_form_email').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
        cy.get('input#register_form_password').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
        cy.get('input#register_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    })

    it('should check for passwords matching', () => {
        const pwd1 = 'test1'
        const pwd2 = 'test2'

        cy.get('input#register_form_password').type(pwd1).should('have.value', pwd1)
        cy.get('input#register_form_confirmPassword').type(pwd2).should('have.value', pwd2)
        cy.get('button#submit-btn').click()

        cy.get('input#register_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    })
})
