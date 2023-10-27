[![Angular Style Guide](https://mgechev.github.io/angular2-style-guide/images/badge.svg)](https://angular.io/styleguide)
[![master Status](https://github.com/infra-geo-ouverte/igo2-lib/workflows/complete/badge.svg)](https://github.com/infra-geo-ouverte/igo2-lib/actions?query=workflow/complete)
[![join chat https://gitter.im/igo2/Lobby](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/igo2/Lobby)
[![Known Vulnerabilities](https://snyk.io/test/github/infra-geo-ouverte/igo2-lib/badge.svg)](https://snyk.io/test/github/infra-geo-ouverte/igo2-lib)

# IGO2 Library

This repository is home to the IGO2 Library on which IGO2 is built. IGO2 and this library are open source projects using Angular, Angular Material and OpenLayers. While IGO2 is mapping oriented, this library can easily serve other purposes as it contains many components and services that may benefit any web application.

## Description

IGO2 library is divided into several elements:

- @igo2/utils : Basic utilies without dependency (ex: base64, clipboard, uuid)

- @igo2/core : Element affecting the core of the application (ex: config, language, message, media, request)

- @igo2/common : Library containing reusable components (ex: clickout, drag-drop, list, panel, spinner, table)

- @igo2/auth : Library grouping the authentication and security module

- @igo2/geo : Library containing the geomatic components. Depends on Openlayers.

- @igo2/context : Library of components uniting @igo2/geo and @igo2/auth

- @igo2/integration : Library integrate basic components

## Demo

- [Demo IGO2 Library](https://infra-geo-ouverte.github.io/igo2-lib/)
- [Demo IGO2 for Open Data Quebec](https://geoegl.msp.gouv.qc.ca/igo2/apercu-qc/)
- [Demo IGO2 on GitHub](https://github.com/infra-geo-ouverte/igo2#table-of-content-english)

## User Installation

The latest release of IGO2 Library can be used and installed from npm.

Example:
`npm install --save @igo2/core`
`npm install --save @igo2/common`

- See the demo code for examples of simple use.

## For developers

### Developer Installation

Require:

| IGO2 version | Node version |
| ------------ | ------------ |
| >= 16.x      | >= 18.10.0   |
| >= 1.15.x    | >= 16.19.x   |
| >= 1.13.x    | >= 14, <= 16 |
|  1.5.x       | >= 12, <= 14 |
| < 1.5.x      | >= 8, <= 11  |
| 0.x.x        | >= 6, <= 10  |

If you want to concurently develop inside the IGO2 Library AND inside any igo2-lib's based project, here some step to follow:
This example is based on IGO2 project (https://github.com/infra-geo-ouverte/igo2.git)

1.  Clone current repository using :`git clone https://github.com/infra-geo-ouverte/igo2-lib.git`
2.  Navigate to the cloned folder : `cd igo2-lib/`
3.  Navigate to the sub project folder : `cd projects`
4.  Clone the sub project repository using : `git clone https://github.com/infra-geo-ouverte/igo2.git`
5.  Navigate to the root folder of igo2-lib
6.  Run `npm install` to install dependencies
7.  If it is your first run, you MUST run `npm run build -w @igo2/core` or `npm run prestart` to ensure to have all required assets (theme, locale, ...)
8. Execute `npm run link.start -w igo2` from IGO2 project OR run or you can run the VsCode config (`Launch IGO2 with link`)


If you strictly want to develop inside IGO2 Library, here some step to follow:

1.  Clone current repository: using `git clone https://github.com/infra-geo-ouverte/igo2-lib.git`
2.  Navigate to the folder igo2-lib : `cd igo2-lib/`
3.  Install dependencies by running `npm install`
3.  Build librairies: `npm run build.libs`
4.  Start form npm `npm start.demo` (or you can run the VsCode config (`Launch Demo`))
5.  Open your browser at http://localhost:4200/

### Build

Run `npm run build.libs` to build the whole project. The build artifacts will be stored in the `dist/` directory.

### Running tests

Run `npm run test.libs` to execute the tests
