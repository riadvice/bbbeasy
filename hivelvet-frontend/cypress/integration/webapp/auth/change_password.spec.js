describe('Test change password form', () => {
    beforeEach(() => {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'password';
        cy.visit('/reset-password')
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Lecturer';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, pwd, pwd)
            }
            cy.get('input#reset_form_email').type(email).should('have.value', email)
            cy.get('button#submit-btn').click()
            cy.wait(1000)
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `SELECT token FROM public.reset_password_tokens WHERE expires_at > now();`
            }).then((response) => {
                cy.visit('/change-password?token='.concat(response.rows[response.rows.length - 1].token))
            })
        })
    })

    it('should loads correctly and check input fields exist', () => {
        cy.checkExistFormFields('change')
    })

    it('should display errors when submitting empty form', () => {
        cy.checkEmptyForm('change')
    })

    it('should check for passwords length', () => {
        cy.checkInvalidForm('change')
    })

    it('should check for passwords matching', () => {
        const fakePwd1 = 'test1'
        const fakePwd2 = 'test2'
        cy.get('input#change_form_password').type(fakePwd1).should('have.value', fakePwd1)
        cy.get('input#change_form_confirmPassword').type(fakePwd2).should('have.value', fakePwd2)
        cy.get('button#submit-btn').click()
        cy.get('input#change_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    })

    it('should render to login page if form is valid', () => {
        const pwd = 'password'
        cy.get('input#change_form_password').type(pwd).should('have.value', pwd)
        cy.get('input#change_form_confirmPassword').type(pwd).should('have.value', pwd)
        cy.get('button#submit-btn').click()
    })
})
