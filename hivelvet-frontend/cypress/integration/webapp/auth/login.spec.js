describe('Test login form', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('should loads correctly and check input fields exist', () => {
        cy.get('form#login_form').should('exist').within(() => {
            cy.get('input#login_form_email').should('be.visible')
            cy.get('input#login_form_password').should('be.visible')
            cy.get('button#submit-btn').should('be.visible')
        })
    })

    it('should display errors when submitting empty form', () => {
        cy.get('button#submit-btn').click()

        cy.get('form#login_form').children('.ant-form-item').get('.ant-form-item-has-error').should('be.visible')
        //cy.get('div.ant-form-item-has-error').last().should('be.visible').should('contain.text', t('password.required'));
    })

    it('should check for email type and password length', () => {
        const invalidEmail = 'test'
        const shortPwd = 'pas'

        cy.get('input#login_form_email').type(invalidEmail).should('have.value', invalidEmail)
        cy.get('input#login_form_password').type(shortPwd).should('have.value', shortPwd)
        cy.get('button#submit-btn').click()

        cy.get('input#login_form_email').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
        cy.get('input#login_form_password').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    })

    it('should display errors when submitting form with invalid credentials', () => {
        const fakeEmail = 'test@gmail.com'
        const fakePwd = 'password'

        cy.get('input#login_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('input#login_form_password').type(fakePwd).should('have.value', fakePwd)
        cy.get('button#submit-btn').click()

        cy.wait(1000)
        cy.get('div.alert-error-msg').should('be.visible')
    })
})
