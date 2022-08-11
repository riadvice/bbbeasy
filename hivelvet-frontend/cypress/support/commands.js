// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('register', (username, email, password, confirmPassword) => {
    cy.visit('/register');
    cy.get('input#register_form_username').type(username);
    cy.get('input#register_form_email').type(email);
    cy.get('input#register_form_password').type(password);
    cy.get('input#register_form_confirmPassword').type(confirmPassword);
    cy.get('input#register_form_agreement').check();
    cy.get('button#submit-btn').click();
    cy.wait(1000);
});

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('input#login_form_email').type(email);
    cy.get('input#login_form_password').type(password);
    cy.get('button#submit-btn').click();
    cy.wait(1000);
});
