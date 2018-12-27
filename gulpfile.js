/*jshint esversion: 6 */
const gulp = require('gulp');
const del = require('del');
const exec = require('gulp-exec');
const merge = require('gulp-merge-json');
const jeditor = require('gulp-json-editor');
const replace = require('gulp-replace');

const package = require('./package.json');
const version = package.version;

gulp.task('core:clean', done => {
  return del([
    'dist/core/assets/**/*',
    'dist/core/style/**/*',
    'dist/core/locale/**/*'
  ]);
});

gulp.task('common:clean', done => {
  return del(['dist/common/assets/**/*', 'dist/common/style/**/*']);
});

gulp.task('auth:clean', done => {
  return del(['dist/auth/assets/**/*', 'dist/auth/style/**/*']);
});

gulp.task('geo:clean', done => {
  return del(['dist/geo/assets/**/*', 'dist/geo/style/**/*']);
});

// ==========================================================

gulp.task('core:copyAssets', done => {
  gulp
    .src('./projects/core/src/assets/**/*', {
      base: './projects/core/src/assets/'
    })
    .pipe(gulp.dest('./dist/core/assets'));

  done();
});

gulp.task('common:copyAssets', done => {
  gulp
    .src('./projects/common/src/assets', {
      base: './projects/common/src/assets/', allowEmpty: true
    })
    .pipe(gulp.dest('./dist/common/assets'));

  done();
});

gulp.task('auth:copyAssets', done => {
  gulp
    .src('./projects/auth/src/assets', {
      base: './projects/auth/src/assets/', allowEmpty: true
    })
    .pipe(gulp.dest('./dist/auth/assets'));

  done();
});

gulp.task('geo:copyAssets', done => {
  gulp
    .src('./projects/geo/src/assets/**/*', {
      base: './projects/geo/src/assets/'
    })
    .pipe(gulp.dest('./dist/geo/assets'));

  done();
});

// ==========================================================

gulp.task('core:copyStyles', done => {
  gulp
    .src('./projects/core/src/style/**/*')
    .pipe(gulp.dest('./dist/core/style'));

  done();
});

gulp.task('common:copyStyles', done => {
  gulp
    .src('./projects/common/src/style/**/*')
    .pipe(gulp.dest('./dist/common/style'));

  done();
});

gulp.task('auth:copyStyles', done => {
  gulp
    .src('./projects/auth/src/style/**/*')
    .pipe(gulp.dest('./dist/auth/style'));

  done();
});

gulp.task('geo:copyStyles', done => {
  gulp.src('./projects/geo/src/style/**/*').pipe(gulp.dest('./dist/geo/style'));
  done();
});

// ==========================================================

gulp.task('core:bundleStyles', done => {
  return gulp
    .src('.')
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/core/src/style/core.theming.scss -d ./dist/core/style/core.theming.scss'
      )
    )
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/core/src/style/theming.scss -d ./dist/core/style/theming.scss'
      )
    )
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/core/src/style/all.theming.scss -d ./dist/core/style/all.theming.scss'
      )
    )
    .pipe(exec.reporter());
});

gulp.task('common:bundleStyles', done => {
  return gulp
    .src('.')
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/common/src/style/common.theming.scss -d ./dist/common/style/common.theming.scss'
      )
    )
    .pipe(exec.reporter());
});

gulp.task('geo:bundleStyles', done => {
  return gulp
    .src('.')
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/geo/src/style/geo.theming.scss -d ./dist/geo/style/geo.theming.scss'
      )
    )
    .pipe(exec.reporter());
});

// ==========================================================

gulp.task('core:copyLocale', done => {
  gulp
    .src('./projects/core/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
  done();
});

gulp.task('common:copyLocale', done => {
  gulp
    .src('./projects/common/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
  done();
});

gulp.task('auth:copyLocale', done => {
  gulp
    .src('./projects/auth/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
  done();
});

gulp.task('geo:copyLocale', done => {
  gulp.src('./projects/geo/src/locale/*').pipe(gulp.dest('./dist/core/locale'));
  done();
});

gulp.task('context:copyLocale', done => {
  gulp
    .src('./projects/context/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));

  done();
});

gulp.task('tools:copyLocale', done => {
  gulp
    .src('./projects/tools/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));

  done();
});

gulp.task('core:bundleLocale.fr', done => {
  gulp
    .src('./dist/core/locale/fr.*.json')
    .pipe(
      merge({
        fileName: 'fr.json'
      })
    )
    .pipe(gulp.dest('./dist/core/locale'));

  done();
});

gulp.task('core:bundleLocale.en', done => {
  gulp
    .src('./dist/core/locale/en.*.json')
    .pipe(
      merge({
        fileName: 'en.json'
      })
    )
    .pipe(gulp.dest('./dist/core/locale'));

  done();
});

gulp.task(
  'core:bundleLocale',
  gulp.parallel(['core:bundleLocale.fr', 'core:bundleLocale.en'])
);

// ==========================================================

gulp.task('utils:bumpVersion', done => {
  gulp
    .src('./projects/utils/package.json')
    .pipe(
      jeditor({
        version: version
      })
    )
    .pipe(gulp.dest('./projects/utils/.'));

  done();
});

gulp.task('core:bumpVersion', done => {
  gulp
    .src('./projects/core/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./projects/core/.'));

  done();
});

gulp.task('common:bumpVersion', done => {
  gulp
    .src('./projects/common/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/core': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./projects/common/.'));

  done();
});

gulp.task('auth:bumpVersion', done => {
  gulp
    .src('./projects/auth/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/core': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./projects/auth/.'));

  done();
});

gulp.task('geo:bumpVersion', done => {
  gulp
    .src('./projects/geo/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/common': `^${version}`,
          '@igo2/core': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./projects/geo/.'));

  done();
});

gulp.task('context:bumpVersion', done => {
  gulp
    .src('./projects/context/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/auth': `^${version}`,
          '@igo2/common': `^${version}`,
          '@igo2/core': `^${version}`,
          '@igo2/geo': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./projects/context/.'));

  done();
});

gulp.task('tools:bumpVersion', done => {
  gulp
    .src('./projects/tools/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/geo': version,
          '@igo2/context': version
        }
      })
    )
    .pipe(gulp.dest('./projects/tools/.'));

  done();
});

gulp.task(
  'bumpVersion',
  gulp.parallel([
    'utils:bumpVersion',
    'core:bumpVersion',
    'common:bumpVersion',
    'auth:bumpVersion',
    'geo:bumpVersion',
    'context:bumpVersion',
    'tools:bumpVersion'
  ])
);

// ==========================================================

gulp.task('geo:fixOL', done => {
  gulp
    .src(['./node_modules/ol/proj.js'])
    .pipe(replace('@typedef {module:ol/proj/Projection', '@typedef {'))
    .pipe(gulp.dest('./node_modules/ol/'));

  done();
});

// ==========================================================

gulp.task(
  'core',
  gulp.series(
    'core:clean',
    gulp.parallel(['core:copyAssets', 'core:copyStyles', 'core:copyLocale']),
    gulp.parallel(['core:bundleStyles']),
    'core:bundleLocale'
  )
);

gulp.task(
  'common',
  gulp.series(
    'common:clean',
    gulp.parallel([
      'common:copyAssets',
      'common:copyStyles',
      'common:copyLocale'
    ]),
    gulp.parallel(['common:bundleStyles']),
    'core:bundleLocale'
  )
);

gulp.task(
  'auth',
  gulp.series(
    'auth:clean',
    gulp.parallel(['auth:copyAssets', 'auth:copyStyles', 'auth:copyLocale']),
    'core:bundleLocale'
  )
);

gulp.task(
  'geo',
  gulp.series(
    'geo:clean',
    gulp.parallel(['geo:copyAssets', 'geo:copyStyles', 'geo:copyLocale']),
    gulp.parallel(['geo:bundleStyles']),
    'core:bundleLocale'
  )
);

gulp.task('context', gulp.series('context:copyLocale', 'core:bundleLocale'));

gulp.task('tools', gulp.series('tools:copyLocale', 'core:bundleLocale'));

gulp.task(
  'default',
  gulp.series(['core', 'common', 'auth', 'geo', 'context', 'tools'])
);
