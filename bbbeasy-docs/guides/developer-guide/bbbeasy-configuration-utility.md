---
sidebar_position: 2
---

# Getting Started with bbbeasy Configuration Utility for BBBEasy

## Available Scripts

In the project directory, you can run:

### ` bbbeasy [options]`

- Configuration :

  `` --version `` Display BBBEasy version

  `` --selfinstall `` Make bbbeasy runnable from anywhere

  `` --enableinstaller `` Enable BBBEasy installer app

  `` --enableweb `` Enable BBBEasy Web app


- Development :

  `` --enabletests `` Enable running unit tests

  `` --test <-c> <name> `` Run unit tests with a test name. Use for -c coverage

  `` --fix  `` Fix php code style

  `` --migrate `` Run database migrations

  `` --metrics `` Generates code metrics


- Monitoring :

  `` --check `` Check configuration files and processes for problems


- Administration :

  `` --restart `` Restart BBBEasy`` --stop `` Stop BBBEasy

  `` --start `` Start BBBEasy

  `` --clean `` Restart and clean all log files

  `` --cleansessions `` Cleans sessions from the database

  `` --status `` Display running status of components

  `` --zip `` Zip up log files for reporting an error


