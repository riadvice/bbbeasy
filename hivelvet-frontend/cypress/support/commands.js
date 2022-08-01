// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

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

Cypress.Commands.add('checkExistFormFields', (action) => {
    cy.get('form#' + action + '_form').should('exist').within(() => {
        if(action == 'register' || action == 'install' || action == 'users') {
            cy.get('input#' + action + '_form_username').should('be.visible')
        }
        if(action != 'roles') {
            if(action != 'change') {
                cy.get('input#' + action + '_form_email').should('be.visible')
            }
            if(action != 'reset') {
                cy.get('input#' + action + '_form_password').should('be.visible')
            }
        }
        if(action == 'register' || action == 'change') {
            cy.get('input#' + action + '_form_confirmPassword').should('be.visible')
            if(action != 'change') {
                cy.get('input#' + action + '_form_agreement').should('not.be.checked')
            }
        }
        if(action == 'users') {
            cy.get('input#' + action + '_form_role').should('be.visible')
        }
        if(action == 'roles') {
            cy.get('input#' + action + '_form_name').should('be.visible')
            cy.get('input.ant-checkbox-input').should('not.be.checked')
        }
        cy.get('button#submit-btn').should('be.visible')
    })
})

Cypress.Commands.add('checkEmptyForm', (action) => {
    cy.get('button#submit-btn').click()

    cy.get('form#' + action + '_form').children('.ant-form-item').get('.ant-form-item-has-error').should('be.visible')
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

