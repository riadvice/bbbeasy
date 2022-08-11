import './commands';
import '@cypress/code-coverage/support';

const istanbul = require('istanbul-lib-coverage');
const map = istanbul.createCoverageMap({});
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;

Cypress.on('window:before:unload', e => {
    const coverage = e.currentTarget.__coverage__;
    if (coverage) {
        map.merge(coverage);
    };
});

Cypress.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
        return false;
    };
});

after(() => {
    cy.window().then(win => {
        const coverage = win.__coverage__;
        if (coverage) {
            map.merge(coverage);
        };
        cy.writeFile('.nyc_output/out.json', JSON.stringify(map));
        cy.exec('nyc report --reporter=html --lines 0');
    });
});
