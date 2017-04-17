## Submitting bug reports

* Please detail the affected browser(s) and operating system(s)
* Please be sure to state which version of node you're using
* Describe the method to reproduce the bug


## Submitting Pull Requests

* Please rebase your branch against the current master
* Run ```npm install``` to make sure your development dependencies are up-to-date
* Please ensure that the test suite passes and that code is lint free before submitting by running:
 * ```npm test```
* If you've added new functionality, please include tests which validate its behaviour
* Make reference to possible issues on pull request comment


## Git Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>
```

### Type

Must be one of the following:

* feat: A new feature
* fix: A bug fix
* docs: Documentation only changes
* ui: Simple changes to the UI
* i18n: Translation
* style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* refactor: A code change that neither fixes a bug nor adds a feature
* perf: A code change that improves performance
* test: Adding missing or correcting existing tests
* chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
* BREAKING CHANGE: Changes that potentially causes other components to fail

### Scope

The scope could be anything specifying place of the commit change.
You can use * when the change affects more than a single scope.

### Subject

The subject contains succinct description of the change:

* Use the imperative, present tense
* Don't capitalize first letter
* No dot (.) at the end