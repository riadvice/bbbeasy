describe('Test install process', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('should loads correctly install wizard page', () => {
        cy.get('header').should('be.visible')
        cy.get('main').should('be.visible')
        cy.get('footer').should('be.visible')
        cy.get('.install-steps').should('exist')
    })

    it('should loads correctly and check step 1 input fields exist', () => {
        cy.checkExistFormFields('install')
    })

    it('should display errors when submitting empty step 1 form', () => {
        cy.checkEmptyForm('install')
    })

    it('should validate fields of step 1 form', () => {
        cy.checkInvalidForm('install')
    })

    it('should display errors when submitting step 1 form with existing credentials', () => {
        const username = 'Administrator'
        const email = 'administrator@riadvice.tn'
        const pwd = 'password'
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Administrator';`
        }).then((result) => {
            console.log(result.rows.length)
            if (result.rows.length == 0) {
                cy.install(username, email, pwd)
            }
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='Administrator';`
            }).then(() => {
                cy.reload()
                cy.get('input#install_form_username').type(username).should('have.value', username)
                cy.get('input#install_form_email').type(email).should('have.value', email)
                cy.get('input#install_form_password').type(pwd).should('have.value', pwd)
                cy.get('button#submit-btn').click()
                cy.wait(1000)
                cy.get('div.ant-alert-message').should('be.visible')
            })
        })
    })

    it('should loads correctly and check step 2 input fields exist', () => {
        const fakeUsername = 'username'
        const fakeEmail = 'test@gmail.com'
        const fakePwd = 'password'
        cy.get('input#install_form_username').type(fakeUsername).should('have.value', fakeUsername)
        cy.get('input#install_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('input#install_form_password').type(fakePwd).should('have.value', fakePwd)
        cy.get('button#submit-btn').click()
        cy.get('input#install_form_username').should('not.exist')
            .get('input#install_form_email').should('not.exist')
            .get('input#install_form_password').should('not.exist').then(() => {
                cy.get('form#install_form').should('exist').within(() => {
                    cy.get('button.prev').should('be.visible')
                    cy.get('input#install_form_company_name').should('be.visible')
                    cy.get('input#install_form_company_url').should('be.visible')
                    cy.get('input#install_form_platform_name').should('be.visible')
                    cy.get('input#install_form_term_url').should('be.visible')
                    cy.get('input#install_form_policy_url').should('be.visible')
                    cy.get('span.ant-upload.ant-upload-btn').should('be.visible')
                    cy.get('span.rc-color-picker-trigger').should('be.visible')
                })
            })
    })

    it('should display errors when submitting empty step 2 form', () => {
        const fakeUsername = 'username'
        const fakeEmail = 'test@gmail.com'
        const fakePwd = 'password'

        cy.get('input#install_form_username').type(fakeUsername).should('have.value', fakeUsername)
        cy.get('input#install_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('input#install_form_password').type(fakePwd).should('have.value', fakePwd)
        cy.get('button#submit-btn').click()

        cy.get('input#install_form_username').should('not.exist')
            .get('input#install_form_email').should('not.exist')
            .get('input#install_form_password').should('not.exist').then(() => {
                cy.get('form#install_form').should('exist').within(() => {
                    cy.get('button.prev').should('be.visible')

                    cy.get('input#install_form_company_name').clear().should('have.value', '')
                    cy.get('input#install_form_company_url').clear().should('have.value', '')
                    cy.get('input#install_form_platform_name').clear().should('have.value', '')
                    cy.get('button#submit-btn').click()

                    cy.get('input#install_form_company_name').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                    cy.get('input#install_form_company_url').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                    cy.get('input#install_form_platform_name').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                })
        })
    })

    it('should validate fields of step 2 form', () => {
        const fakeUsername = 'username'
        const fakeEmail = 'test@gmail.com'
        const fakePwd = 'password'
        const shortUrl = 'url'
        cy.get('input#install_form_username').type(fakeUsername).should('have.value', fakeUsername)
        cy.get('input#install_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('input#install_form_password').type(fakePwd).should('have.value', fakePwd)
        cy.get('button#submit-btn').click()
        cy.get('input#install_form_username').should('not.exist')
            .get('input#install_form_email').should('not.exist')
            .get('input#install_form_password').should('not.exist').then(() => {
                cy.get('form#install_form').should('exist').within(() => {
                    cy.get('button.prev').should('be.visible')
                    cy.get('input#install_form_company_url').clear().type(shortUrl).should('have.value', shortUrl)
                    cy.get('input#install_form_term_url').clear().type(shortUrl).should('have.value', shortUrl)
                    cy.get('input#install_form_policy_url').clear().type(shortUrl).should('have.value', shortUrl)
                    cy.get('button#submit-btn').click()
                    cy.get('input#install_form_company_url').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                    cy.get('input#install_form_term_url').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                    cy.get('input#install_form_policy_url').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
                })
            })
    })
})