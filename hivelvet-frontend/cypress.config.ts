import {defineConfig} from 'cypress'

export default defineConfig({
    defaultCommandTimeout: 10000,
    e2e: {
        baseUrl: 'http://hivelvet.test:3300',
        env: {
            "hivelvet": {
                "user": "hivelvet",
                "host": "localhost",
                "database": "hivelvet",
                "password": "hivelvet",
                "port": 5432
            },
            setupNodeEvents(on, config) {
                require('@cypress/code-coverage/task')(on, config)
                // tell Cypress to use .babelrc file
                // and instrument the specs files
                // only the extra application files will be instrumented
                // not the spec files themselves
                on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))

                return config
            }
        }
    }
})
