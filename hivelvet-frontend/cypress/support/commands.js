// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('beforeEach', (action, method) => {
    const username = 'Professor';
    const email = 'professor@riadvice.tn'
    const pwd = 'professor';
    if (action == 'reset') {
        cy.visit('/reset-password')
    }
    cy.task('database', {
        dbConfig: Cypress.env("hivelvet"),
        sql: `SELECT * FROM public.users WHERE username='Professor';`
    }).then((result) => {
        if (result.rows.length == 0) {
            cy.register(username, email, pwd, pwd)
        }
        if(action == 'reset') {
            cy.get('input#' + action + '_form_email').type(email).should('have.value', email)
            cy.get('button#submit-btn').click()
            cy.wait(1000)
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `SELECT token FROM public.reset_password_tokens ORDER BY expires_at DESC;`
            }).then((response) => {
                cy.visit('/change-password?token='.concat(response.rows[0].token))
            })
        }
        if(action == 'users' || action == 'roles') {
            cy.task('database', {
                dbConfig: Cypress.env("hivelvet"),
                sql: `UPDATE public.users SET status='active' WHERE username='Professor';`
            }).then(() => {
                cy.login(email, pwd)
                cy.visit('/settings/' + action)
                if(method == 'add') {
                    cy.get('button#add-' + action.slice(0, -1) + '-btn').click()
                }
            })
        }
    })
})

Cypress.Commands.add('install', (username, email, pwd) => {
    cy.visit('/')
    cy.get('input#install_form_username').type(username)
    cy.get('input#install_form_email').type(email)
    cy.get('input#install_form_password').type(pwd)
    cy.get('button#submit-btn').click()
    cy.wait(1000)
    cy.get('button#submit-btn').click()
    cy.wait(1000)
    cy.get('button#submit-btn').click()
    cy.wait(1000)
})

Cypress.Commands.add('register', (username, email, pwd, confirmPwd) => {
    cy.visit('/register')
    cy.get('input#register_form_username').type(username)
    cy.get('input#register_form_email').type(email)
    cy.get('input#register_form_password').type(pwd)
    cy.get('input#register_form_confirmPassword').type(confirmPwd)
    cy.get('input#register_form_agreement').check()
    cy.get('button#submit-btn').click()
    cy.wait(1000)
})

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login')
    cy.get('input#login_form_email').type(email)
    cy.get('input#login_form_password').type(password)
    cy.get('button#submit-btn').click()
    cy.wait(1000)
})

Cypress.Commands.add('checkExistFormFields', (action, method) => {
    if((action != 'users' || action != 'roles') && method != 'edit') {
        cy.get('form#' + action + '_form').should('exist').within(() => {
            if(action == 'register' || action == 'install' || (action == 'users' && method == 'add')) {
                cy.get('input#' + action + '_form_username').should('be.visible')
            }
            if(action != 'roles' && action != 'change' || (action == 'users' && method != 'edit')) {
                cy.get('input#' + action + '_form_email').should('be.visible')
            }
                if(action != 'reset' && action == 'users' && method != 'edit') {
                cy.get('input#' + action + '_form_password').should('be.visible')
            }
            if(action == 'register' || action == 'change') {
                cy.get('input#' + action + '_form_confirmPassword').should('be.visible')
                if(action != 'change') {
                    cy.get('input#' + action + '_form_agreement').should('not.be.checked')
                }
            }
            if(action == 'users' && method == 'add') {
                cy.get('input#' + action + '_form_role').should('be.visible')
            }
            if(action == 'roles' && method == 'add') {
                cy.get('input#' + action + '_form_name').should('be.visible')
                cy.get('input.ant-checkbox-input').should('not.be.checked')
            }
        }
    )}
    if((action == 'users' || action == 'roles') && method == 'edit') {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'lecturer';
        const role ='lecturer';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users;`
        }).then((result) => {
            if (result.rows.length != 0) {
                cy.get('.ant-table-tbody').find('tr').should('have.length', result.rows.length)
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT * FROM public.users WHERE username='Lecturer';`
                }).then((response) => {
                    if (response.rows.length == 0) {
                        cy.get('input#users_form_username').type(username).should('have.value', username)
                        cy.get('input#users_form_email').type(email).should('have.value', email)
                        cy.get('input#users_form_password').type(pwd).should('have.value', pwd)
                        cy.get('input#users_form_role').click()
                        cy.get('div.ant-select-item-option-content').each(($element) => {
                            if ($element.text() == role) {
                                cy.wrap($element).click()
                            }
                        })
                        cy.get('button#submit-btn').click()
                        cy.wait(1000)
                    }
                    if(action == 'users') {
                        cy.contains(email).parents('tr').find('a.ant-space-item').first().click()
                        cy.get('input#username').should('be.visible')
                        cy.get('input#email').should('be.visible')
                        cy.get('span.ant-select-selection-item').should('be.visible')
                        cy.get('button#submit-btn').should('be.visible')
                    }
                    if(action == 'roles') {
                        cy.contains(role.charAt(0).toUpperCase() + role.slice(1)).parents('tr').find('button#edit-role-btn').click()
                        cy.get('input#name').should('be.visible')
                        cy.get('button#save-name-btn').should('be.visible')
                    }
                })
            }
        })
    }
    cy.get('button#submit-btn').should('be.visible')
})

Cypress.Commands.add('checkEmptyForm', (action, method) => {
    if((action == 'users' || action == 'roles') && method == 'edit') {
        const username = 'Lecturer';
        const email = 'lecturer@riadvice.tn'
        const pwd = 'lecturer';
        const role ='lecturer';
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users;`
        }).then((result) => {
            if (result.rows.length != 0) {
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT * FROM public.users WHERE username='Lecturer';`
                }).then((response) => {
                    if (response.rows.length == 0) {
                        cy.get('input#users_form_username').type(username).should('have.value', username)
                        cy.get('input#users_form_email').type(email).should('have.value', email)
                        cy.get('input#users_form_password').type(pwd).should('have.value', pwd)
                        cy.get('input#users_form_role').click()
                        cy.get('div.ant-select-item-option-content').each(($element) => {
                            if ($element.text() == role) {
                                cy.wrap($element).click()
                            }
                            cy.get('button#submit-btn').click()
                            cy.wait(1000)
                        })
                    }
                    if(action == 'users') {
                        cy.contains(email).parents('tr').find('a.ant-typography').first().click()
                        cy.get('input#username').should('be.visible').clear().should('have.value', '')
                        cy.get('input#email').should('be.visible').clear().should('have.value', '')
                        cy.get('span.ant-select-selection-item').click()
                        cy.get('span.ant-select-clear').click()
                        cy.get('span.ant-select-selection-item').should('be.visible').should('have.value', '')
                    }
                    if(action == 'roles') {
                        cy.contains(role.charAt(0).toUpperCase() + role.slice(1)).parents('tr').find('button#edit-role-btn').click({ force: true })
                        cy.get('input#name').should('be.visible').clear().should('have.value', '')
                    }
                })
            }
        })
    }
    cy.get('button#submit-btn').click()
    if(method == 'add') {
        cy.get('form#' + action + '_form').children('.ant-form-item').get('.ant-form-item-has-error').should('be.visible')
    }
    if(method == 'edit') {
        cy.get('tr.ant-table-row ant-table-row-level-0').children('.ant-form-item').get('.ant-form-item-has-error').should('be.visible')
    }
})

Cypress.Commands.add('checkInvalidForm', (action) => {
    const shortUsername = 'abc'
    const invalidEmail = 'test'
    const shortPwd = 'pas'
    const role = 'lecturer'
    if(action == 'register' || action == 'install' || action == 'users') {
        cy.get('input#' + action + '_form_username').type(shortUsername).should('have.value', shortUsername)
    }
    if(action != 'change') {
        cy.get('input#' + action + '_form_email').type(invalidEmail).should('have.value', invalidEmail)
    }
    if(action != 'reset') {
        cy.get('input#' + action + '_form_password').type(shortPwd).should('have.value', shortPwd)
    }
    if(action == 'register' || action == 'change') {
        cy.get('input#' + action + '_form_confirmPassword').type(shortPwd).should('have.value', shortPwd)
        if(action != 'change') {
            cy.get('input#' + action + '_form_agreement').check()
        }
    }
    if(action == 'users') {
        cy.get('input#' + action + '_form_role').click() 
        cy.get('div.ant-select-item-option-content').each(($element) => {
            if ($element.text() == role) {
                cy.wrap($element).click()
            }
        })
    }
    cy.get('button#submit-btn').click()

    if(action == 'register' || action == 'install' || action == 'users') {
        cy.get('input#' + action + '_form_username').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
    if(action != 'change') {
        cy.get('input#' + action + '_form_email' || action == 'users').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
    if(action != 'reset') {
        cy.get('input#' + action + '_form_password' || action == 'users').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
    if(action == 'register' || action == 'change') {
        cy.get('input#' + action + '_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
})

Cypress.Commands.add('changePassword', (password) => {
    const pwd = password
    cy.get('input#change_form_password').type(pwd).should('have.value', pwd)
    cy.get('input#change_form_confirmPassword').type(pwd).should('have.value', pwd)
    cy.get('button#submit-btn').click()
})

Cypress.Commands.add('checkPasswordFields', (action) => {
    const fakePwd1 = 'test1'
    const fakePwd2 = 'test2'
    cy.get('input#' + action + '_form_password').type(fakePwd1).should('have.value', fakePwd1)
    cy.get('input#' + action + '_form_confirmPassword').type(fakePwd2).should('have.value', fakePwd2)
    cy.get('button#submit-btn').click()
    cy.get('input#' + action + '_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
})

Cypress.Commands.add('checkSubmittedForm', (action, method) => {
    const fakeEmail = 'test@gmail.com'
    const fakePwd = 'password'
    const username = 'Professor';
    const email = 'professor@riadvice.tn'
    const pwd = 'professor';
    const role = 'lecturer';
    if(action == 'login') {
        cy.get('input#' + action + '_form_password').type(fakePwd).should('have.value', fakePwd)
    }
    if(action != 'home' && action != 'users' && action != 'roles') {
        cy.get('input#' + action + '_form_email').type(fakeEmail).should('have.value', fakeEmail)
        cy.get('button#submit-btn').click()
        cy.wait(1000)
    }
    if(action == 'login') {
        cy.get('div.alert-error-msg').should('be.visible')
    }
    if(action == 'reset') {
        cy.get('div.alert-msg').should('be.visible')
    }
    if(action == 'register' || action  == 'home' || action == 'users') {
        cy.task('database', {
            dbConfig: Cypress.env("hivelvet"),
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, pwd, pwd)
            }
            if (action == 'register') {
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `UPDATE public.users SET status='active' WHERE username='Professor';`
                }).then(() => {
                    cy.register(username, email, pwd, pwd)
                    cy.get('div.alert-msg').should('be.visible')
                })
            }
            if(action =='home') {
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `UPDATE public.users SET status='active' WHERE username='Professor';`
                }).then(() => {
                    cy.login(email, pwd)
                    cy.get('button.profil-btn').click()
                    cy.get('a#logout-btn').click()
                    cy.wait(1000)
                    cy.location('pathname').should('eq', '/login')
                })
            }
            if(action == 'users' && method == 'add') {
                cy.get('input#' + action + '_form_username').type(username).should('have.value', username)
                cy.get('input#' + action + '_form_email').type(email).should('have.value', email)
                cy.get('input#' + action + '_form_password').type(pwd).should('have.value', pwd)
                cy.get('input#' + action +'_form_role').click() 
                cy.get('div.ant-select-item-option-content').each(($element) => {
                    if ($element.text() == role) {
                        cy.wrap($element).click()
                    }
                    cy.get('button#submit-btn').click()
                    cy.wait(1000)
                    cy.get('div.alert-msg').should('be.visible')
                })
            }
            if(action == 'roles' && method == 'add') {
                cy.task('database', {
                    dbConfig: Cypress.env("hivelvet"),
                    sql: `SELECT name FROM public.roles;`
                }).then((result) => {
                    if(result.rows.length != 0) {
                        cy.get('input#' + action + '_form_name').type(result.rows[0].name).should('have.value', result.rows[0].name)
                    }
                    cy.get('button#submit-btn').click()
                    cy.wait(1000)
                    cy.get('input#' + action + '_form_name').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible'); 
                })
            }
        })
    }
})
