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

Cypress.Commands.add('install', (username, email, password, hex, action) => {
    cy.get('button.lang-btn').click();
    cy.get('span.ant-radio:' + action).click();
    cy.get('input#install_form_username').type(username).should('have.value', username);
    cy.get('input#install_form_email').type(email).should('have.value', email);
    cy.get('input#install_form_password').type(password).should('have.value', password);
    cy.get('button#submit-btn').click();
    cy.get('input[type=file]').selectFile({ contents: 'cypress/fixtures/example.json', fileName: 'file.png' }, { force: true });
    cy.get('button.ant-btn-icon-only').click();
    cy.get('input[type=file]').selectFile({ contents: 'cypress/fixtures/example.json', fileName: 'file.json' }, { force: true });
    cy.get('input[type=file]').selectFile({ contents: 'cypress/fixtures/example.json', fileName: 'file.jpeg' }, { force: true });
    cy.get('span.rc-color-picker-trigger').each(($span) => {
        cy.get($span).click({force: true});
        cy.get('input.rc-color-picker-panel-params-hex').clear().type(hex).should('have.value', hex).type('Cypress.io{enter}');
    });
    cy.get('button#submit-btn').click({force: true});
    cy.get('div.presets-grid:first').click();
    cy.get('button.ant-modal-close').click({force: true});
    cy.get('div.presets-grid:first').click();
    cy.get('button.ant-switch:first').click({force: true});
    cy.get('div.ant-modal-footer').find('button').click();
    cy.get('button#submit-btn').click().wait(500);
    cy.get('div.ant-result-icon').should('be.visible').and('have.length', 1);
    cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
    cy.removeUser(username);
});

Cypress.Commands.add('register', (username, email, password) => {
    cy.visit('/register');
    cy.get('input#register_form_username').type(username);
    cy.get('input#register_form_email').type(email);
    cy.get('input#register_form_password').type(password);
    cy.get('input#register_form_confirmPassword').type(password);
    cy.get('input#register_form_agreement').check();
    cy.get('button#submit-btn').click().wait(500);
    cy.task('database', { sql: `UPDATE public.users SET status = 'active' WHERE username = '` + username + `';` });
});

Cypress.Commands.add('requestEmail', (username, email, wait) => {
    cy.visit('/reset-password');
    cy.get('input#reset_email').type(email).should('have.value', email);
    cy.get('button.login-form-button').click().wait(500);
    if (wait) {
        cy.task('database', { sql: `UPDATE public.reset_password_tokens SET expires_at = NOW() + INTERVAL '5 seconds' WHERE token = (SELECT token FROM public.reset_password_tokens WHERE user_id = (SELECT id from public.users WHERE username = '` + username + `') ORDER BY created_on DESC LIMIT 1);` });
        cy.wait(5000);
    }
    cy.task('database', {
        sql: `SELECT token FROM public.reset_password_tokens WHERE user_id = (SELECT id from public.users WHERE username = '` + username + `') ORDER BY created_on DESC LIMIT 1;`
    }).then((response) => {
        cy.visit('/change-password?token='.concat(response.rows[0].token));
    });
});

Cypress.Commands.add('changePassword', (password) => {
    cy.get('input#change_password').type(password).should('have.value', password);
    cy.get('input#change_confirmPassword').type(password).should('have.value', password);
    cy.get('button.login-form-button').click().wait(500);
    cy.get('a.ant-btn-primary').click();
    cy.location('pathname').should('eq', '/login');
});

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login', {
        onBeforeLoad (win) {
            Object.defineProperty(win.navigator, 'language', {
                value: 'de-DE'
            });
        }
    });
    cy.get('input#login_form_email').type(email);
    cy.get('input#login_form_password').type(password);
    cy.get('button#submit-btn').click().wait(500);
});

Cypress.Commands.add('locate', (index, key, action, color) => {
    let successful = false;
    cy.get('tbody.ant-table-tbody').children('tr.ant-table-row').should('be.visible').and('have.length', index < 5 ? index : 5).each(($tr) => {
        if ($tr.children(':first').text() == capitalize(key ? key : '') && action == 'mouseover' && !color) {
            cy.contains(capitalize(key)).trigger(action).children(':last').click();
            successful = true;
        } else if ($tr.children(':first').text() == capitalize(key ? key : '') && (action == 'first' || action == 'last') && !color) {
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
            cy.locate(index, key, action, color);
        }
    });
});

Cypress.Commands.add('addAdmin', (username, email, password) => {
    cy.visit('/');
    cy.get('input#install_form_username').type(username);
    cy.get('input#install_form_email').type(email);
    cy.get('input#install_form_password').type(password);
    cy.get('button#submit-btn').click().wait(500);
    cy.get('button#submit-btn').click();
    cy.get('button#submit-btn').click().wait(500);
});

Cypress.Commands.add('addRole', (rolename) => {
    cy.get('button#add-role-btn').click();
    cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
    cy.get('button.cell-input-save').click().wait(500);
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
    cy.get('button#submit-btn').click().wait(500);
});

Cypress.Commands.add('updateStatus', (email, action, color, status) => {
    cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
        cy.locate(response.rows.length, email, action, null);
    });
    cy.get('div.ant-select-in-form-item:last').click();
    cy.get('div.ant-select-item-option-content').each(($status) => {
        if ($status.text() == capitalize(status)) {
            cy.wrap($status).click();
        }
    });
    cy.get('button.cell-input-save').click().wait(500);
    cy.get('ul.ant-table-pagination').children().eq(1).children().click();
    cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
        cy.locate(response.rows.length, email, null, color);
    });
});

Cypress.Commands.add('removeRole', () => {
    cy.task('database', { sql: `DELETE FROM public.roles_permissions WHERE role_id = (SELECT id from public.roles WHERE LOWER(name) = 'tutor' OR LOWER(name) = 'teacher' OR LOWER(name) = 'student');` });
    cy.task('database', { sql: `DELETE FROM public.roles WHERE LOWER(name) = 'tutor' OR LOWER(name) = 'teacher' OR LOWER(name) = 'student';` });
    cy.reload();
});

Cypress.Commands.add('removeUser', (username) => {
    cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id = (SELECT id from public.users WHERE LOWER(username) = '` + username.toLowerCase() + `');` });
    cy.task('database', { sql: `DELETE FROM public.users WHERE LOWER(username) = '` + username.toLowerCase() + `';` });
    cy.reload();
});
