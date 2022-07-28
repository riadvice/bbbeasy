describe('Test change password form', () => {
    beforeEach(() => {
        cy.visit('/reset-password')
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT email FROM public.users;`
        }).then((result) => {
            if(result.length != 0) {
                cy.get('input#reset_form_email').type(result.rows[0].email).should('have.value', result.rows[0].email)
                cy.get('button#submit-btn').click()
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT token FROM public.reset_password_tokens WHERE expires_at > now();`
                }).then((response) => {
                    cy.visit('/change-password?token='.concat(response.rows[response.rows.length - 1].token))
                })
            }
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
        const pwd = 'pass'
        const confirmPwd = 'pass'
        cy.get('input#change_form_password').type(pwd).should('have.value', pwd)
        cy.get('input#change_form_confirmPassword').type(confirmPwd).should('have.value', confirmPwd)
        cy.get('button#submit-btn').click()
    })
})
