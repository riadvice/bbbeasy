describe('Test render of home page', () => {
    it('should render to login page if user not logged in', () => {
        cy.visit('/home');
        cy.location('pathname').should('eq', '/login');
    });
    it('should render to login page if user logged out', () => {
        const username = 'Professor';
        const email = 'professor@riadvice.tn';
        const password = 'professor';
        cy.task('database', {
            sql: `SELECT * FROM public.users WHERE username='Professor';`
        }).then((result) => {
            if (result.rows.length == 0) {
                cy.register(username, email, password, password);
            };
            cy.task('database', {
                sql: `UPDATE public.users SET status='active' WHERE username='Professor';`
            }).then(() => {
                cy.login(email, password);
                cy.get('button.profil-btn').click();
                cy.get('a#logout-btn').click();
                cy.wait(1000);
                cy.location('pathname').should('eq', '/login');
            });
        });
    });
});
