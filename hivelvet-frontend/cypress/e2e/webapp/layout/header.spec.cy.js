describe('Test header component', () => {
    beforeEach(() => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
                cy.task('database', { sql: `UPDATE public.users SET status='active' WHERE username='Professor';` });
            }
            cy.login(email, password);
        });
    });
    it('should change website language', () => {
        let index = 0, oldIndex, newIndex;
        cy.get('button.lang-btn').click();
        cy.get('div.ant-radio-group').children().children().children().children().get('input').each(($input) => {
            if ($input.is(':checked')) {
                oldIndex = index;
            } else if (!$input.is(':checked')) {
                $input.click();
                newIndex = index;
            } else if (typeof (oldIndex) === 'number' && typeof (newIndex) === 'number') {
                cy.get('div.ant-radio-group').children().children().children().children().get('input').eq(oldIndex).should('not.be.checked');
                cy.get('div.ant-radio-group').children().children().children().children().get('input').eq(newIndex).should('be.checked');
            }
            index = ++index;
        });
    });
    it('should render to login page if user logged out', () => {
        cy.get('button.profil-btn').click();
        cy.get('a#logout-btn').click();
        cy.wait(1000);
        cy.location('pathname').should('eq', '/login');
    });
});
