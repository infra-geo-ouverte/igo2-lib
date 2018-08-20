/*jshint esversion: 6 */
const gulp = require('gulp');
const del = require('del');
const exec = require('gulp-exec');
const merge = require('gulp-merge-json');
const gulpSequence = require('gulp-sequence');
const jeditor = require('gulp-json-editor');
const replace = require('gulp-replace');

const package = require('./package.json');
const version = package.version;

gulp.task('core:clean', () => {
  return del([
    'dist/core/assets/**/*',
    'dist/core/style/**/*',
    'dist/core/locale/**/*'
  ]);
});

gulp.task('common:clean', () => {
  return del(['dist/common/assets/**/*', 'dist/common/style/**/*']);
});

gulp.task('auth:clean', () => {
  return del(['dist/auth/assets/**/*', 'dist/auth/style/**/*']);
});

gulp.task('geo:clean', () => {
  return del(['dist/geo/assets/**/*', 'dist/geo/style/**/*']);
});

// ==========================================================

gulp.task('core:copyAssets', () => {
  gulp
    .src('./projects/core/src/assets/**/*', {
      base: './projects/core/src/assets/'
    })
    .pipe(gulp.dest('./dist/core/assets'));
});

gulp.task('common:copyAssets', () => {
  gulp
    .src('./projects/common/src/assets', {
      base: './projects/common/src/assets/'
    })
    .pipe(gulp.dest('./dist/common/assets'));
});

gulp.task('auth:copyAssets', () => {
  gulp
    .src('./projects/auth/src/assets', {
      base: './projects/auth/src/assets/'
    })
    .pipe(gulp.dest('./dist/auth/assets'));
});

gulp.task('geo:copyAssets', () => {
  gulp
    .src('./projects/geo/src/assets/**/*', {
      base: './projects/geo/src/assets/'
    })
    .pipe(gulp.dest('./dist/geo/assets'));
});

// ==========================================================

gulp.task('core:copyStyles', () => {
  gulp
    .src('./projects/core/src/style/**/*')
    .pipe(gulp.dest('./dist/core/style'));
});

gulp.task('common:copyStyles', () => {
  gulp
    .src('./projects/common/src/style/**/*')
    .pipe(gulp.dest('./dist/common/style'));
});

gulp.task('auth:copyStyles', () => {
  gulp
    .src('./projects/auth/src/style/**/*')
    .pipe(gulp.dest('./dist/auth/style'));
});

gulp.task('geo:copyStyles', () => {
  gulp.src('./projects/geo/src/style/**/*').pipe(gulp.dest('./dist/geo/style'));
});

// ==========================================================

gulp.task('core:bundleStyles', () => {
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

gulp.task('common:bundleStyles', () => {
  return gulp
    .src('.')
    .pipe(
      exec(
        'node ./node_modules/scss-bundle/dist/bundle-cli.js -e ./projects/common/src/style/common.theming.scss -d ./dist/common/style/common.theming.scss'
      )
    )
    .pipe(exec.reporter());
});

gulp.task('geo:bundleStyles', () => {
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

gulp.task('core:copyLocale', () => {
  gulp
    .src('./projects/core/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('common:copyLocale', () => {
  gulp
    .src('./projects/common/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('auth:copyLocale', () => {
  gulp
    .src('./projects/auth/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('geo:copyLocale', () => {
  gulp.src('./projects/geo/src/locale/*').pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('context:copyLocale', () => {
  gulp
    .src('./projects/context/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('tools:copyLocale', () => {
  gulp
    .src('./projects/tools/src/locale/*')
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('core:bundleLocale.fr', () => {
  gulp
    .src('./dist/core/locale/fr.*.json')
    .pipe(
      merge({
        fileName: 'fr.json'
      })
    )
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('core:bundleLocale.en', () => {
  gulp
    .src('./dist/core/locale/en.*.json')
    .pipe(
      merge({
        fileName: 'en.json'
      })
    )
    .pipe(gulp.dest('./dist/core/locale'));
});

gulp.task('core:bundleLocale', [
  'core:bundleLocale.fr',
  'core:bundleLocale.en'
]);

// ==========================================================

gulp.task('utils:bumpVersion', () => {
  gulp
    .src('./projects/utils/package.json')
    .pipe(
      jeditor({
        version: version
      })
    )
    .pipe(gulp.dest('./projects/utils/.'));
});

gulp.task('core:bumpVersion', () => {
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
});

gulp.task('common:bumpVersion', () => {
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
});

gulp.task('auth:bumpVersion', () => {
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
});

gulp.task('geo:bumpVersion', () => {
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
});

gulp.task('context:bumpVersion', () => {
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
});

gulp.task('tools:bumpVersion', () => {
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
});

gulp.task('bumpVersion', [
  'utils:bumpVersion',
  'core:bumpVersion',
  'common:bumpVersion',
  'auth:bumpVersion',
  'geo:bumpVersion',
  'context:bumpVersion',
  'tools:bumpVersion'
]);

// ==========================================================

gulp.task('geo:fixOL', () => {
  gulp
    .src(['./node_modules/ol/proj.js'])
    .pipe(replace('@typedef {module:ol/proj/Projection', '@typedef {'))
    .pipe(gulp.dest('./node_modules/ol/'));
});

// ==========================================================

gulp.task(
  'core',
  gulpSequence(
    'core:clean',
    ['core:copyAssets', 'core:copyStyles', 'core:copyLocale'],
    ['core:bundleStyles'],
    'core:bundleLocale'
  )
);

gulp.task(
  'common',
  gulpSequence(
    'common:clean',
    ['common:copyAssets', 'common:copyStyles', 'common:copyLocale'],
    ['common:bundleStyles'],
    'core:bundleLocale'
  )
);

gulp.task(
  'auth',
  gulpSequence(
    'auth:clean',
    ['auth:copyAssets', 'auth:copyStyles', 'auth:copyLocale'],
    'core:bundleLocale'
  )
);

gulp.task(
  'geo',
  gulpSequence(
    'geo:clean',
    ['geo:copyAssets', 'geo:copyStyles', 'geo:copyLocale'],
    ['geo:bundleStyles'],
    'core:bundleLocale'
  )
);

gulp.task('context', gulpSequence(['context:copyLocale'], 'core:bundleLocale'));

gulp.task('tools', gulpSequence(['tools:copyLocale'], 'core:bundleLocale'));

gulp.task('default', ['core', 'common', 'auth', 'geo', 'context', 'tools']);
