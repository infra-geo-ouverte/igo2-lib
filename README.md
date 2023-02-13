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
| >= 1.15.x    | >= 16.x      |
| >= 1.13.x    | >= 14, <= 16 |
|  1.5.x       | >= 12, <= 14 |
| < 1.5.x      | >= 8, <= 11  |
| 0.x.x        | >= 6, <= 10  |

If you want to develop in IGO2 Library, it can be installed by:

1.  Clone current repository: using `git clone https://github.com/infra-geo-ouverte/igo2-lib.git`
2.  Deploy in `cd igo2-lib/` and install from npm `npm install`
3.  Build librairies: `npm run build.libs`
4.  Start form npm `npm start`
5.  Open your browser at http://localhost:4200/

### Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the demo's source files.
If you modify files from the lib (../packages/\*) you must run:

1. npm run build.libs to rebuild all the libs
2. OR
3. npm run build.geo if you have only modifyed the geo package or whatever part of the lib...
4. OR
5. npm run start.watch to be aware of any modifications done to the lib.

### Build

Run `npm run build.libs` to build the whole project. The build artifacts will be stored in the `dist/` directory.

### Running tests

Run `npm run test.libs` to execute the tests
