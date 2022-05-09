// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
Cypress.Commands.add('checkExistFormFields', (action) => {
    cy.get('form#' + action + '_form').should('exist').within(() => {
        if(action == 'register' || action == 'install') {
            cy.get('input#' + action + '_form_username').should('be.visible')
        }
        cy.get('input#'+action+'_form_email').should('be.visible')
        cy.get('input#'+action+'_form_password').should('be.visible')
        if(action == 'register') {
            cy.get('input#' + action + '_form_confirmPassword').should('be.visible')
            cy.get('input#' + action + '_form_agreement').should('not.be.checked')
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

    if(action == 'register' || action == 'install') {
        cy.get('input#' + action + '_form_username').type(shortUsername).should('have.value', shortUsername)
    }
    cy.get('input#' + action + '_form_email').type(invalidEmail).should('have.value', invalidEmail)
    cy.get('input#' + action + '_form_password').type(shortPwd).should('have.value', shortPwd)
    if(action == 'register') {
        cy.get('input#' + action + '_form_confirmPassword').type(shortPwd).should('have.value', shortPwd)
        cy.get('input#' + action + '_form_agreement').check()
    }
    cy.get('button#submit-btn').click()

    if(action == 'register' || action == 'install') {
        cy.get('input#' + action + '_form_username').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
    cy.get('input#' + action + '_form_email').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    cy.get('input#' + action + '_form_password').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    if(action == 'register') {
        cy.get('input#' + action + '_form_confirmPassword').parent().parent().parent().parent().get('div.ant-form-item-has-error').should('be.visible');
    }
})

