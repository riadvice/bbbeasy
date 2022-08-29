// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const capitalize = (word) => { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); }

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

Cypress.Commands.add('findInPage', (index, key, action, color) => {
    let successful = false;
    cy.get('tbody.ant-table-tbody').children().should('have.length', index < 5 ? index : 5).each(($tr) => {
        if ($tr.children().eq(0).text() == capitalize(key ? key : '') && action == 'mouseover' && !color) {
            cy.contains(capitalize(key)).trigger(action).children(':last').click();
            successful = true;
        } else if ($tr.children().eq(0).text() == capitalize(key ? key : '') && action == 'first' && !color) {
            cy.contains(capitalize(key)).parent().children(':last').children().children(':' + action).children().click();
            successful = true;
        } else if ($tr.children().eq(1).text() == key && action && !color) {
            cy.contains(key).parent().children(':last').children().children(':' + action).children().click();
            successful = true;
        } else if ($tr.children().eq(1).text() == key && !action && color) {
            cy.contains(key).parent().children().eq(3).children().should('have.class', 'ant-tag' + color);
            successful = true;
        }
    }).then(() => {
        index -= 5;
        if (!successful && index > 0) {
            cy.get('li.ant-pagination-next').click();
            cy.findInPage(index, key, action, color);
        }
    });
});

Cypress.Commands.add('addRole', (rolename) => {
    cy.get('button#add-role-btn').click();
    cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    cy.get('button#submit-btn').click();
    cy.wait(1000);
});

Cypress.Commands.add('addUser', (username, email, password) => {
    const rolename = 'lecturer';
    cy.get('button#add-user-btn').click();
    cy.get('input#users_form_username').type(username).should('have.value', username);
    cy.get('input#users_form_email').type(email).should('have.value', email);
    cy.get('input#users_form_password').type(password).should('have.value', password);
    cy.get('input#users_form_role').click();
    cy.get('div.ant-select-item-option-content').each(($role) => {
        if ($role.text() == rolename) {
            cy.wrap($role).click();
        }
    });
    cy.get('button#submit-btn').click();
    cy.wait(1000);
});

Cypress.Commands.add('setUserStatus', (email, action, color, status) => {
    cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
        cy.findInPage(response.rows.length, email, action, null);
    });
    cy.get('div.ant-select-in-form-item:last').click();
    cy.get('div.ant-select-item-option-content').each(($status) => {
        if ($status.text() == capitalize(status)) {
            cy.wrap($status).click();
        }
    });
    cy.get('button.cell-input-save').click();
    cy.wait(1000);
    cy.get('ul.ant-table-pagination').children().eq(1).children().click();
    cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
        cy.findInPage(response.rows.length, email, null, color);
    });
    cy.get('div.ant-notification-notice-success').should('have.length', 1);
});
