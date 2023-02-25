---
sidebar_position: 3
---

# Getting Started with hivelvet Configuration Utility for Hivelvet

## Available Scripts

In the project directory, you can run:

### ` hivelvet [options]`

- Configuration :

  `` --version `` Display Hivelvet version

  `` --selfinstall `` Make hivelvet runnable from anywhere

  `` --enableinstaller `` Enable Hivelvet installer app

  `` --enableweb `` Enable Hivelvet Web app


- Development :

  `` --enabletests `` Enable running unit tests

  `` --test <-c> <name> `` Run unit tests with a test name. Use for -c coverage

  `` --fix  `` Fix php code style

  `` --migrate `` Run database migrations

  `` --metrics `` Generates code metrics


- Monitoring :

  `` --check `` Check configuration files and processes for problems


- Administration :

  `` --restart `` Restart Hivelvet`` --stop `` Stop Hivelvet

  `` --start `` Start Hivelvet

  `` --clean `` Restart and clean all log files

  `` --cleansessions `` Cleans sessions from the database

  `` --status `` Display running status of components

  `` --zip `` Zip up log files for reporting an error


