// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular/cli/plugins/karma')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [
      {
        pattern: './src/locale/*.json',
        watched: false,
        included: false,
        nocache: false,
        served: true
      },
      {
        pattern: './src/demo-app/assets/locale/*.json',
        watched: false,
        included: false,
        nocache: false,
        served: true
      },
      {
        pattern: './src/demo-app/contexts/*.json',
        watched: false,
        included: false,
        nocache: false,
        served: true
      },
      { pattern: './src/test/test.ts', watched: false }
    ],
    preprocessors: {
      './src/test/test.ts': ['@angular/cli']
    },
    coverageIstanbulReporter: {
      reports: [ 'html', 'lcovonly' ],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false
  });

  if (process.env.TRAVIS) {
    config.browsers = ['Chrome_travis_ci'];
    config.singleRun = true;
    config.browserNoActivityTimeout = 90000;
  }
};
