// change_password.spec.cy.js

describe('Test change password process if token valid', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.task('database', {
                sql: `SELECT token FROM public.reset_password_tokens ORDER BY expires_at DESC;`
            }).then((response) => {
                cy.visit('/change-password?token='.concat(response.rows[0].token));
            });
        });
    });
    it('should load correctly change password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#change_form').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 2);
            cy.get('input#change_form_password').should('be.visible').and('have.length', 1);
            cy.get('input#change_form_confirmPassword').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#change_form_password').should('have.value', '');
        cy.get('input#change_form_confirmPassword').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should validate form inputs', () => {
        const password = 'pwd';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should check for passwords matching', () => {
        const password = 'password';
        const confirmPassword = 'confirmPassword';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(confirmPassword).should('have.value', confirmPassword);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should render to login page if form valid', () => {
        const password = 'hivelvet-teacher';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('a.ant-btn-primary').click();
        cy.location('pathname').should('eq', '/login');
    });
    it('should fix login problems by reverting to previous password', () => {
        const password = 'hivelvet-professor';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
    });
    it('should display errors when submitting old password', () => {
        const password = 'hivelvet-professor';
        cy.get('input#change_form_password').type(password).should('have.value', password);
        cy.get('input#change_form_confirmPassword').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1); 
    });
});
describe('Test change password process if token expired', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.task('database', {
                sql: `SELECT token FROM public.reset_password_tokens ORDER BY expires_at DESC;`
            }).then((response) => {
                cy.wait(900000);
                cy.visit('/change-password?token='.concat(response.rows[10].token));
            });
        });
    });
    it('should render to invalid password reset token page', () => {
        cy.get('div.ant-form-item-label').should('not.exist');
        cy.get('input#change_form_password').should('not.exist');
        cy.get('input#change_form_confirmPassword').should('not.exist');
        cy.get('button#submit-btn').should('not.exist');
        cy.get('div.ant-result-image').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('a.ant-btn.color-blue').should('be.visible').and('have.length', 1);
    });
});

// login.spec.cy.js

describe('Test login process', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.visit('/register');
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='professor';` });
            }
            cy.visit('/login');
        });
    });
    it('should load correctly login wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#login_form').should('exist').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 2);
            cy.get('input#login_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#login_form_password').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#login_form_email').should('have.value', '');
        cy.get('input#login_form_password').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should validate form inputs', () => {
        const email = 'email';
        const password = 'pwd';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should display errors when submitting form with invalid credentials', () => {
        const email = 'test@riadvice.tn';
        const password = 'password';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(password).should('have.value', password);
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.alert-error-msg').should('be.visible').and('have.length', 1);
    });
    it('should render to home page when submitting form with existing credentials', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='test';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='test';` });
            }
            cy.visit('/login');
            cy.get('input#login_form_email').type(email).should('have.value', email);
            cy.get('input#login_form_password').type(password).should('have.value', password);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.ant-notification').should('be.visible').and('have.length', 1);
            cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='test');` });
            cy.task('database', { sql: `DELETE FROM public.users WHERE username='test';` });
        });
    });
});

// register.spec.cy.js

describe('Test register process', () => {
    beforeEach(() => {
        cy.visit('/register');
    });
    it('should load correctly register wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#register_form').should('exist').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 4);
            cy.get('input#register_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_password').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_confirmPassword').should('be.visible').and('have.length', 1);
            cy.get('input#register_form_agreement').should('exist').and('have.length', 1);
            cy.get('label.ant-checkbox-wrapper').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#register_form_username').should('have.value', '');
        cy.get('input#register_form_email').should('have.value', '');
        cy.get('input#register_form_password').should('have.value', '');
        cy.get('input#register_form_confirmPassword').should('have.value', '');
        cy.get('input#register_form_agreement').should('not.be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 5);
    });
    it('should validate form inputs', () => {
        const username = 'usr';
        const email = 'email';
        const password = 'pwd';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(password).should('have.value', password);
        cy.get('input#register_form_agreement').should('not.be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 5);
    });
    it('should check for passwords matching', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'password';
        const confirmPassword = 'confirmPassword';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(confirmPassword).should('have.value', confirmPassword);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with existing credentials', () => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='professor';` });
            }
            cy.get('input#register_form_username').clear().type(username).should('have.value', username);
            cy.get('input#register_form_email').clear().type(email).should('have.value', email);
            cy.get('input#register_form_password').clear().type(password).should('have.value', password);
            cy.get('input#register_form_confirmPassword').clear().type(password).should('have.value', password);
            cy.get('input#register_form_agreement').check().should('be.checked');
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
        });
    });
    it('should render to success register page when submitting form with valid credentials', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(password).should('have.value', password);
        cy.get('input#register_form_confirmPassword').type(password).should('have.value', password);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click();
        cy.wait(1000);
        cy.get('div.ant-result-icon').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-extra').should('be.visible').and('have.length', 1);
        cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='test');` });
        cy.task('database', { sql: `DELETE FROM public.users WHERE username='test';` });
    });
});

// reset_password.spec.cy.js

describe('Test reset password process', () => {
    beforeEach(() => {
        cy.visit('/reset-password');
    });
    it('should load correctly reset password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#reset_form').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 1);
            cy.get('input#reset_form_email').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#reset_form_email').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should validate form input', () => {
        const email = 'email';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with invalid credential', () => {
        const email = 'test@riadvice.tn';
        cy.get('input#reset_form_email').type(email).should('have.value', email);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
    });
    it('should display success notification when submitting form with existing email', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const password = 'hivelvet-test';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='test';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            }
            cy.visit('/reset-password');
            cy.get('input#reset_form_email').type(email).should('have.value', email);
            cy.get('button#submit-btn').click();
            cy.wait(1000);
            cy.get('div.ant-notification').should('be.visible').and('have.length', 1);
            cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='test');` });
            cy.task('database', { sql: `DELETE FROM public.users WHERE username='test';` });
        });
    });
});

// home.spec.cy.js

describe('Test render of home page if user logged in', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='professor';` }).then((response) => {
            if (response.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='professor';` });
            }
            cy.login(email, password);
        });
    });
    it('should render to home page', () => {
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
});

describe('Test render of home page if user not logged in', () => {
    it('should render to login page', () => {
        cy.visit('/home');
        cy.location('pathname').should('eq', '/login');
    });
});

// landing_page.spec.cy.js

describe('Test landing page render', () => {
    it('should load correctly landing wizard page', () => {
        cy.visit('/');
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
        cy.get('div.landing-content').should('be.visible');
        cy.get('a.login-btn').should('be.visible');
        cy.get('a.register-btn').should('be.visible');
        cy.get('div.features').should('be.visible');
    });
});

// roles.spec.cy.js

describe('Test roles component', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='professor';` }).then((response) => {
            if (response.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='professor';` });
            }
            cy.login(email, password);
            cy.visit('/settings/roles');
        });
    });
    it('should display roles paginated list', () => {
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length);
        });
    });
    it('should load correctly and check add role form elements exist', () => {
        cy.get('button#add-role-btn').click();
        cy.get('form#roles_form').should('be.visible').within(() => {
            cy.get('label.ant-form-item-required').should('be.visible').and('have.length', 1);
            cy.get('input#roles_form_name').should('be.visible').and('have.length', 1);
            cy.get('div.ant-card').should('be.visible').and('have.length', 5);
            cy.get('button.cancel-btn').should('be.visible').and('have.length', 1);
            cy.get('button.cell-input-save').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty add role form', () => {
        cy.get('button#add-role-btn').click();
        cy.get('input#roles_form_name').should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should add new role', () => {
        const rolename = 'tutor';
        cy.task('database', { sql: `SELECT * FROM public.roles WHERE name='tutor';` }).then((response) => {
            if (response.rows.length != 0) {
                cy.get('button#add-role-btn').click();
                cy.get('button.cancel-btn').click();
                cy.task('database', { sql: `DELETE FROM public.roles_permissions where role_id=(SELECT id from public.roles WHERE name='tutor');` });
                cy.task('database', { sql: `DELETE FROM public.roles WHERE name='tutor';` });
                cy.reload();
            }
            cy.addRole(rolename);
            cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty edit form', () => {
        const rolename = 'tutor';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
        });
        cy.get('input#name').clear().should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
        it('should display errors when submitting add role form with existing rolename', () => {
        cy.get('button#add-role-btn').click();
        cy.task('database', { sql: `SELECT name FROM public.roles;` }).then((result) => {
            if (result.rows.length != 0) {
                cy.get('input#roles_form_name').type(result.rows[0].name).should('have.value', result.rows[0].name);
            }
            cy.get('button.cell-input-save').click();
            cy.wait(1000);
            cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
        });
    });
    it('should set role permissions', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
            cy.wait(1000);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children().each(($div) => {
            $div.children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click()
        });
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should show cancel confirmation when editing role', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
            cy.wait(1000);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.get('input.ant-checkbox-input').should('not.visible');
    });
    it('should not make changes on role', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.findInPage(response.rows.length, rolename, action, null);
        });
        cy.get('button.cell-input-save').click();
        cy.wait(1000);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
    it('should delete role', () => {
        const rolename = 'tutor';
        const action = 'last';
        cy.task('database', {
            sql: `SELECT * FROM public.roles;`
        }).then((result) => {
            cy.get('.ant-table-tbody').find('tr').should('be.visible').and('have.length', result.rows.length);
            cy.task('database', {
                sql: `SELECT * FROM public.roles WHERE name='tutor';`
            }).then((response) => {
                if (response.rows.length == 0) {
                    cy.get('button#add-role-btn').click();
                    cy.get('input#roles_form_name').type(rolename).should('have.value', rolename);
                    cy.get('button.cell-input-save').click();
                    cy.wait(1000);
                    result.rows.length = ++result.rows.length;
                    cy.get('.ant-table-tbody').find('tr').should('be.visible').and('have.length', result.rows.length);
                }
                cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
                    cy.findInPage(response.rows.length, rolename, action, null);
                });
                cy.get('div.ant-popover-buttons').children('button:last').click();
                cy.wait(1000);
                cy.get('.ant-table-tbody').find('tr').should('be.visible').and('have.length', result.rows.length - 1);
            });
        });
    });
});

// users.spec.cy.js

describe('Test users component', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='professor';` }).then((response) => {
            if (response.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='professor';` });
            }
            cy.login(email, password);
            cy.visit('/settings/users');
        });
    });
    it('should display users paginated list', () => {
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length);
        });
    });
    it('should load correctly and check add user form elements exist', () => {
        cy.get('button#add-user-btn').click();
        cy.get('form#users_form').should('be.visible').within(() => {
            cy.get('label.ant-form-item-required').should('be.visible').and('have.length', 4);
            cy.get('input#users_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#users_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#users_form_password').should('be.visible').and('have.length', 1);
            cy.get('button.cancel-btn').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty add user form', () => {
        cy.get('button#add-user-btn').click();
        cy.get('input#users_form_username').should('have.value', '');
        cy.get('input#users_form_email').should('have.value', '');
        cy.get('input#users_form_password').should('have.value', '');
        cy.get('input#users_form_role').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 4);
    });
    it('should add new user', () => {
        const username = 'lecturer';
        const email = 'lecturer@riadvice.tn';
        const password = 'hivelvet-lecturer';
        const color = '-warning';
        cy.task('database', { sql: `SELECT * FROM public.users WHERE username='lecturer';` }).then((response) => {
            if (response.rows.length != 0) {
                cy.get('button#add-user-btn').click();
                cy.get('button.cancel-btn').click();
                cy.task('database', { sql: `DELETE FROM public.reset_password_tokens WHERE user_id=(SELECT id from public.users WHERE username='lecturer');` });
                cy.task('database', { sql: `DELETE FROM public.users WHERE username='lecturer';` });
                cy.reload();
            }
            cy.addUser(username, email, password);
            cy.task('database', { sql: `SELECT * FROM public.users;` }).then((result) => {
                cy.findInPage(result.rows.length, email, null, color);
            });
            cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty edit form', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('input#username').clear().should('have.value', '');
        cy.get('input#email').clear().should('have.value', '');
        cy.get('span.ant-select-selection-item').click({ multiple: true }).get('span.ant-select-clear').click({ multiple: true });
        cy.get('input#role').should('have.value', '');
        cy.get('input#status').should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 4);
    });
    it('should validate edit user form inputs', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('input#username').clear().type('usr').should('have.value', 'usr');
        cy.get('input#email').clear().type('email').should('have.value', 'email');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should display errors when submitting add user form with existing credentials', () => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        const password = 'hivelvet-professor';
        cy.addUser(username, email, password);
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
    });
    it('should set user status to active', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-success';
        const status = 'active';
        cy.setUserStatus(email, action, color, status);
    });
    it('should set user status to inactive', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-default';
        const status = 'inactive';
        cy.setUserStatus(email, action, color, status);
    });
    it('should set user status to banned', () => {
        const email = 'lecturer@riadvice.tn';
        const color = '';
        cy.task('database', { sql: `UPDATE public.users SET status = 'banned' WHERE username = 'lecturer';` });
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, null, color);
        });
    });
    it('should show cancel confirmation when editing user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('span.ant-select-selection-item').click({ multiple: true }).get('span.ant-select-clear').click({ multiple: true });
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.get('input#username').should('not.exist');
        cy.get('input#email').should('not.exist');
        cy.get('input#role').should('not.exist');
        cy.get('input#status').should('not.exist');
    });
    it('should not make changes on user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-cancel').click();
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-save').click();
        cy.wait(1000);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
    it('should delete user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        const color = '-error';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.wait(1000);
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, null, color);
        });
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should not delete user already deleted', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.findInPage(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.wait(1000);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
});
