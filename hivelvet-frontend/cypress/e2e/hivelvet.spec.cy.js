const short_secret = 'pwd';
const secret = 'hivelvet-password-2022';
const test_secret = 'hivelvet-Test-2022';
const wrong_secret = 'hivelvet-Wrong-2022';
const confirm_secret = 'hivelvet-Confirm-2022';
const student_secret = 'hivelvet-Student-2022';
const teacher_secret = 'hivelvet-Teacher-2022';
const lecturer_secret = 'hivelvet-Lecturer-2022';
const professor_secret = 'hivelvet-Professor-2022';
const admin_secret = 'hivelvet-Administrator-2022';

// // cypress checkpoint

// describe('Wait 30 seconds until enabling installer app (manually)', () => {
//     it('should finish cypress checkpoint', () => {
//         cy.wait(30000);
//     });
// });

// installer app initiation

describe('Initiate testing installer app', () => {
    it('should set initiation state', () => {
        const testname = 'test';
        const username = 'administrator';
        const email = 'administrator@riadvice.tn';
        cy.removeUser(testname);
        cy.removeUser(username);
        cy.addAdmin(username, email, admin_secret);
    });
});

// install.spec.cy.js

describe('Test install process', () => {
    beforeEach(() => {
        cy.visit('/');
    });
    it('should load correctly install wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
        cy.get('div.ant-steps-item').should('be.visible').and('have.length', 3);
    });
    it('should load correctly and check step 1 form elements exist', () => {
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 1);
            cy.get('label').should('be.visible').and('have.length', 3);
            cy.get('input#install_form_username').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_email').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_password').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty step 1 form', () => {
        cy.get('input#install_form_username').should('have.value', '');
        cy.get('input#install_form_email').should('have.value', '');
        cy.get('input#install_form_password').should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should validate step 1 form inputs inputs', () => {
        const username = 'usr';
        const email = 'email';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(short_secret).should('have.value', short_secret);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should display errors when submitting step 1 form with existing credentials', () => {
        const username = 'administrator';
        const email = 'administrator@riadvice.tn';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(admin_secret).should('have.value', admin_secret);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
    });
    it('should load correctly and check step 2 form elements exist', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const step_2_test_secret = 'hivelvet-Test-2022';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(step_2_test_secret).should('have.value', step_2_test_secret);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_username').should('not.exist');
        cy.get('input#install_form_email').should('not.exist');
        cy.get('input#install_form_password').should('not.exist');
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 2);
            cy.get('label').should('be.visible').and('have.length', 9);
            cy.get('input#install_form_company_name').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_company_url').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_platform_name').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_term_url').should('be.visible').and('have.length', 1);
            cy.get('input#install_form_policy_url').should('be.visible').and('have.length', 1);
            cy.get('div.ant-upload').should('be.visible').and('have.length', 1);
            cy.get('span.rc-color-picker-trigger').should('be.visible').and('have.length', 4);
            cy.get('button.prev').should('be.visible').and('have.length', 1);
            cy.get('button#submit-btn').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty step 2 form', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const test_secret_not_empty = 'hivelvet-Test-2022';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(test_secret_not_empty).should('have.value', test_secret_not_empty);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_name').clear().should('have.value', '');
        cy.get('input#install_form_company_url').clear().should('have.value', '');
        cy.get('input#install_form_platform_name').clear().should('have.value', '');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should validate step 2 form inputs', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const test_secret_valid = 'hivelvet-Test-2022';
        const url = 'url';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(test_secret_valid).should('have.value', test_secret_valid);
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_url').clear().type(url).should('have.value', url);
        cy.get('input#install_form_term_url').clear().type(url).should('have.value', url);
        cy.get('input#install_form_policy_url').clear().type(url).should('have.value', url);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 3);
    });
    it('should load correctly and check step 3 form elements exist', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const step_3_test_secret = 'hivelvet-Test-2022';
        cy.get('input#install_form_username').type(username).should('have.value', username);
        cy.get('input#install_form_email').type(email).should('have.value', email);
        cy.get('input#install_form_password').type(step_3_test_secret).should('have.value', step_3_test_secret);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('button#submit-btn').click();
        cy.get('button.prev').click();
        cy.get('button#submit-btn').click();
        cy.get('input#install_form_company_name').should('not.exist');
        cy.get('input#install_form_company_url').should('not.exist');
        cy.get('input#install_form_platform_name').should('not.exist');
        cy.get('input#install_form_term_url').should('not.exist');
        cy.get('input#install_form_policy_url').should('not.exist');
        cy.get('div.ant-upload').should('not.exist');
        cy.get('span.rc-color-picker-trigger').should('not.exist');
        cy.get('form#install_form').should('be.visible').within(() => {
            cy.get('h4.ant-typography').should('be.visible').and('have.length', 1);
            cy.get('div.ant-alert').should('be.visible').and('have.length', 1);
            cy.get('div.ant-card-grid').should('be.visible').and('have.length', 17);
            cy.get('button.prev').should('be.visible');
            cy.get('button#submit-btn').should('be.visible');
        });
    });
    it('should display success install page when submitting form with valid credentials (english version)', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const hex = 'ffffff';
        const english_version_action = 'first';
       cy.install(username, email, test_secret, hex, english_version_action);
    });
    it('should display success install page when submitting form with valid credentials (arabic version)', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const hex = 'ffffff';
        const arabic_version_action = 'last';
       cy.install(username, email, test_secret, hex, arabic_version_action);
    });
});

// installer app completion

describe('Finish testing installer app', () => {
    it('should set completion state', () => {
        const username = 'administrator';
        cy.removeUser(username);
    });
});

// cypress checkpoint

describe('Wait 30 seconds until enabling web app (manually)', () => {
    it('should finish cypress checkpoint', () => {
        cy.wait(30000);
    });
});

// web app initiation

describe('Initiate testing web app', () => {
    it('should set initiation state', () => {
        const testname = 'test';
        const stuname = 'student';
        const lectname = 'lecturer';
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        cy.removeUser(testname);
        cy.removeUser(stuname);
        cy.removeUser(lectname);
        cy.removeUser(username);
        cy.removeRole();
        cy.register(username, email, professor_secret);
    });
});

// change_password.spec.cy.js

describe('Test change password process if token valid', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        cy.requestEmail(username, email, false);
    });
    it('should load correctly change password wizard page', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });
    it('should load correctly and check form elements exist', () => {
        cy.get('form#change').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 2);
            cy.get('input#change_password').should('be.visible').and('have.length', 1);
            cy.get('input#change_confirmPassword').should('be.visible').and('have.length', 1);
            cy.get('button.login-form-button').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#change_password').should('have.value', '');
        cy.get('input#change_confirmPassword').should('have.value', '');
        cy.get('button.login-form-button').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should validate form inputs', () => {
        cy.get('input#change_password').type(short_secret).should('have.value', short_secret);
        cy.get('input#change_confirmPassword').type(short_secret).should('have.value', short_secret);
        cy.get('button.login-form-button').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should check for passwords matching', () => {
        cy.get('input#change_password').type(secret).should('have.value', secret);
        cy.get('input#change_confirmPassword').type(confirm_secret).should('have.value', confirm_secret);
        cy.get('button.login-form-button').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should render to login page if form valid', () => {
        cy.changePassword(teacher_secret);
    });
    it('should fix login problems by reverting to previous password', () => {
        cy.get('input#change_password').type(professor_secret).should('have.value', professor_secret);
        cy.get('input#change_confirmPassword').type(professor_secret).should('have.value', professor_secret);
        cy.get('button.login-form-button').click();
    });
    it('should display errors when submitting old password', () => {
        const professor_old_secret = 'hivelvet-Professor-2022';
        cy.get('input#change_password').type(professor_old_secret).should('have.value', professor_old_secret);
        cy.get('input#change_confirmPassword').type(professor_old_secret).should('have.value', professor_old_secret);
        cy.get('button.login-form-button').click().wait(500);
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1); 
    });
});

describe('Test change password process if token expired', () => {
    beforeEach(() => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        cy.requestEmail(username, email, true);
    });
    it('should render to invalid password reset token page', () => {
        cy.get('div.ant-form-item-label').should('not.exist');
        cy.get('input#change_password').should('not.exist');
        cy.get('input#change_confirmPassword').should('not.exist');
        cy.get('button.login-form-button').should('not.exist');
        cy.get('div.ant-result-image').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('a.ant-btn.color-blue').should('be.visible').and('have.length', 1);
    });
});

// login.spec.cy.js

describe('Test login process', () => {
    beforeEach(() => {
        cy.visit('/login');
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
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(short_secret).should('have.value', short_secret);
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should display errors when submitting form with invalid credentials', () => {
        const email = 'test@riadvice.tn';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(secret).should('have.value', secret);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.alert-error-msg').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with invalid password', () => {
        const email = 'professor@riadvice.tn';
        const secret_invalid = 'password';
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(secret_invalid).should('have.value', secret_invalid);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.alert-error-msg').should('be.visible').and('have.length', 1);
    });
    it('should render to home page when submitting form with existing credentials', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        cy.register(username, email, test_secret);
        cy.visit('/login');
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(test_secret).should('have.value', test_secret);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.ant-notification').should('be.visible').and('have.length', 1);
    });
    it('should sent password reset email when account blocked after 3 wrong password attempts', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        cy.get('button.lang-btn').click();
        cy.get('span.ant-radio:last').click();
        cy.get('input#login_form_email').type(email).should('have.value', email);
        cy.get('input#login_form_password').type(wrong_secret).should('have.value', wrong_secret);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.ant-alert-message').children().children().click();
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
        cy.requestEmail(username, email, false);
        cy.changePassword(wrong_secret);
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
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(short_secret).should('have.value', short_secret);
        cy.get('input#register_form_confirmPassword').type(short_secret).should('have.value', short_secret);
        cy.get('input#register_form_agreement').should('not.be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 5);
    });
    it('should check for passwords matching', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        cy.removeUser(username);
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(secret).should('have.value', secret);
        cy.get('input#register_form_confirmPassword').type(confirm_secret).should('have.value', confirm_secret);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with existing credentials', () => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        cy.get('input#register_form_username').clear().type(username).should('have.value', username);
        cy.get('input#register_form_email').clear().type(email).should('have.value', email);
        cy.get('input#register_form_password').clear().type(professor_secret).should('have.value', professor_secret);
        cy.get('input#register_form_confirmPassword').clear().type(professor_secret).should('have.value', professor_secret);
        cy.get('input#register_form_agreement').check().should('be.checked');
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
    });
    it('should render to success register page when submitting form with valid credentials', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        cy.get('input#register_form_username').type(username).should('have.value', username);
        cy.get('input#register_form_email').type(email).should('have.value', email);
        cy.get('input#register_form_password').type(test_secret).should('have.value', test_secret);
        cy.get('input#register_form_confirmPassword').type(test_secret).should('have.value', test_secret);
        cy.get('input#register_form_agreement').click().should('be.checked');
        cy.get('button#submit-btn').click().wait(500);
        cy.get('div.ant-result-icon').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-extra').should('be.visible').and('have.length', 1);
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
        cy.get('form#reset').should('be.visible').within(() => {
            cy.get('div.ant-form-item-label').should('be.visible').and('have.length', 1);
            cy.get('input#reset_email').should('be.visible').and('have.length', 1);
            cy.get('button.login-form-button').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting empty form', () => {
        cy.get('input#reset_email').should('have.value', '');
        cy.get('button.login-form-button').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should validate form input', () => {
        const email = 'email';
        cy.get('input#reset_email').type(email).should('have.value', email);
        cy.get('button.login-form-button').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting form with invalid credential', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        cy.removeUser(username);
        cy.get('input#reset_email').type(email).should('have.value', email);
        cy.get('button.login-form-button').click();
        cy.get('div.ant-alert-message').should('be.visible').and('have.length', 1);
    });
    it('should display success notification when submitting form with existing email', () => {
        const username = 'test';
        const email = 'test@riadvice.tn';
        const test_secret_valid = "hivelvet-Test-2022";
        cy.register(username, email, test_secret_valid);        
        cy.visit('/reset-password');
        cy.get('input#reset_email').type(email).should('have.value', email);
        cy.get('button.login-form-button').click().wait(500);
        cy.get('div.ant-notification').should('be.visible').and('have.length', 1);
    });
});

// home.spec.cy.js

describe('Test home page render if user logged in', () => {
    beforeEach(() => {
        const email = 'professor@riadvice.tn';
        cy.login(email, professor_secret);
    });
    it('should render to home page', () => {
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should change website language', () => {
        cy.get('button.lang-btn').click();
        cy.get('span.ant-radio:last').click();
        cy.get('button.lang-btn').children(':last').should('have.text', ' العربية');
    });
    it('should render to presets page', () => {
        cy.get('ul.ant-menu').children().eq(2).click();
        cy.get('button.lang-btn').click();
        cy.get('span.ant-radio:last').click();
        cy.get('span.ant-page-header-heading-title').should('have.text', 'الإعدادات المسبقة');
    });
    it('should render to login page if user logged out', () => {
        cy.get('button.profil-btn').click();
        cy.get('a#logout-btn').click();
        cy.location('pathname').should('eq', '/login');
    });
});

describe('Test home page render if user not logged in', () => {
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

// page_not_found.spec.cy.js

describe('Test not found page render', () => {
    it('render to not found page if route not exist', () => {
        cy.visit('/xxx');
        cy.get('div.ant-result-image').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-title').should('be.visible').and('have.length', 1);
        cy.get('div.ant-result-subtitle').should('be.visible').and('have.length', 1);
        cy.get('a.ant-btn.color-blue').should('be.visible').and('have.length', 1);
    });
});

// roles.spec.cy.js

describe('Test roles component', () => {
    beforeEach(() => {
        const email = 'professor@riadvice.tn';
        const professor_secret_roles = 'hivelvet-Professor-2022';
        cy.login(email, professor_secret_roles);
        cy.visit('/settings/roles');
    });
    it('should display roles paginated list', () => {
        cy.get('button#add-role-btn').click();
        cy.get('button.cancel-btn').click();
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length);
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
        cy.addRole(rolename);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting empty edit form', () => {
        const rolename = 'tutor';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('input#name').clear().should('have.value', '');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting add role form with existing rolename', () => {
        cy.get('button#add-role-btn').click();
        cy.task('database', { sql: `SELECT name FROM public.roles;` }).then((response) => {
            cy.get('input#roles_form_name').type(response.rows[0].name).should('have.value', response.rows[0].name);
            cy.get('button.cell-input-save').click().wait(500);
            cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
        });
    });
    it('should display errors when submitting edit role form with existing rolename', () => {
        const old_rolename = 'tutor';
        const new_rolename = 'lecturer';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, old_rolename, action, null);
        });
        cy.get('input#name').clear().type(new_rolename).should('have.value', new_rolename);
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 1);
    });
    it('should edit role permissions', () => {
        const rolename = 'tutor';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('button.cell-input-cancel').click();
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children().each(($div) => {
            $div.children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        });
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should edit rolename', () => {
        const old_rolename = 'tutor';
        const new_rolename = 'teacher';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, old_rolename, action, null);
        });
        cy.get('input#name').clear().type(new_rolename).should('have.value', new_rolename);
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should show cancel confirmation when editing role', () => {
        const rolename = 'teacher';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('div.bordered-card').children(':first').children(':last').children().children().children().children().children().children().children().children().children(':first').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':first').click();
        cy.get('button.cell-input-cancel').click();
        cy.get('div.ant-popover-buttons').children(':last').click();
        cy.get('input.ant-checkbox-input').should('not.visible');
    });
    it('should not make changes on role permissions', () => {
        const rolename = 'teacher';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
    it('should not make changes on rolename', () => {
        const rolename = 'teacher';
        const action = 'mouseover';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
    it('should delete unassigned role', () => {
        const rolename = 'teacher';
        const action = 'last';
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, rolename, action, null);
        });
        cy.get('div.ant-popover-buttons').children('button:last').click().wait(500);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should delete assigned role', () => {
        const stuname = 'student';
        const email = 'student@riadvice.tn';
        const action = 'last';
        cy.addRole(stuname);
        cy.visit('/settings/users');
        cy.addUser(stuname, email, student_secret);
        cy.task('database', { sql: `UPDATE public.users SET role_id = (SELECT id FROM public.roles WHERE name = '` + stuname + `') WHERE username = '` + stuname + `';` });
        cy.visit('/settings/roles');
        cy.task('database', { sql: `SELECT * FROM public.roles;` }).then((response) => {
            cy.locate(response.rows.length, stuname, action, null);
        });
        cy.get('div.ant-popover-buttons').children('button:last').click().wait(500);
        cy.get('div.ant-modal-confirm-btns').children('button:last').click().wait(500);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
});

// users.spec.cy.js

describe('Test users component', () => {
    beforeEach(() => {
        const email = 'professor@riadvice.tn';
        const professor_secret_users = 'hivelvet-Professor-2022';
        cy.login(email, professor_secret_users);
        cy.visit('/settings/users');
    });
    it('should display users paginated list', () => {
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length);
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
        const color = '-warning';
        cy.addUser(username, email, lecturer_secret);
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((result) => {
            cy.locate(result.rows.length, email, null, color);
        });
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting add user form with existing credentials', () => {
        const username = 'professor';
        const email = 'professor@riadvice.tn';
        cy.addUser(username, email, professor_secret);
        cy.get('div.alert-msg').should('be.visible').and('have.length', 1);
    });
    it('should display errors when submitting empty edit form', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, action, null);
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
            cy.locate(response.rows.length, email, action, null);
        });
        cy.get('input#username').clear().type('usr').should('have.value', 'usr');
        cy.get('input#email').clear().type('email').should('have.value', 'email');
        cy.get('button.cell-input-save').click();
        cy.get('div.ant-form-item-has-error').should('be.visible').and('have.length', 2);
    });
    it('should display errors when submitting edit user form with existing username', () => {
        const old_username = 'professor';
        const new_username = 'lecturer';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, old_username, action, null);
        });
        cy.get('input#username').clear().type(new_username).should('have.value', new_username);
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-form-item-explain-error').should('be.visible').and('have.length', 1);
    });
    it('should set user status to active', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-success';
        const status = 'active';
        cy.updateStatus(email, action, color, status);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should set user status to inactive', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        const color = '-default';
        const status = 'inactive';
        cy.updateStatus(email, action, color, status);
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should set user status to banned', () => {
        const email = 'lecturer@riadvice.tn';
        const color = '';
        cy.task('database', { sql: `UPDATE public.users SET status = 'banned' WHERE username = 'lecturer';` });
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, null, color);
        });
    });
    it('should show cancel confirmation when editing user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'first';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, action, null);
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
            cy.locate(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-cancel').click();
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, action, null);
        });
        cy.get('button.cell-input-save').click().wait(500);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
    it('should delete user', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        const color = '-error';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click().wait(500);
        cy.get('ul.ant-table-pagination').children().eq(1).children().click();
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, null, color);
        });
        cy.get('div.ant-notification-notice-success').should('be.visible').and('have.length', 1);
    });
    it('should not delete user already deleted', () => {
        const email = 'lecturer@riadvice.tn';
        const action = 'last';
        cy.task('database', { sql: `SELECT * FROM public.users;` }).then((response) => {
            cy.locate(response.rows.length, email, action, null);
        });
        cy.get('div.ant-popover-buttons').children(':last').click().wait(500);
        cy.get('div.ant-notification-notice-info').should('be.visible').and('have.length', 1);
    });
});

// web app completion

describe('Finish testing web app', () => {
    it('should set completion state', () => {
        const testname = 'test';
        const stuname = 'student';
        const lectname = 'lecturer';
        const username = 'professor';
        cy.removeUser(testname);
        cy.removeUser(stuname);
        cy.removeUser(lectname);
        cy.removeUser(username);
        cy.removeRole();
    });
});
