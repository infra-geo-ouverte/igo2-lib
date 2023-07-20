const gulp = require('gulp');
const jeditor = require('gulp-json-editor');
const replace = require('gulp-replace');

const package = require('./package.json');
const version = package.version;

// ==========================================================

gulp.task('prepublishOnly', done => {
  gulp.src('./dist/auth/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/auth'));
  gulp.src('./dist/common/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/common'));
  gulp.src('./dist/context/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/context'));
  gulp.src('./dist/core/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/core'));
  gulp.src('./dist/geo/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/geo'));
  gulp.src('./dist/integration/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/integration'));
  gulp.src('./dist/utils/package.json').pipe(replace(/.*prepublishOnly[^\n]*/g, '')).pipe(gulp.dest('./dist/utils'));
  done();
});

// ==========================================================
gulp.task('bumpVersion-utils', done => {
  gulp
    .src('./packages/utils/package.json')
    .pipe(
      jeditor({
        version: version
      })
    )
    .pipe(gulp.dest('./packages/utils/.'));

  done();
});

gulp.task('bumpVersion-core', done => {
  gulp
    .src('./packages/core/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./packages/core/.'));

  gulp
    .src(['./packages/core/src/lib/config/version.ts'])
    .pipe(replace(/lib: '[A-Za-z0-9\.\-]+'/g, `lib: '${version}'`))
    .pipe(replace(/releaseDate: [0-9]+/g, `releaseDate: ${Date.now()}`))
    .pipe(gulp.dest('./packages/core/src/lib/config/.'));

  done();
});

gulp.task('bumpVersion-common', done => {
  gulp
    .src('./packages/common/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/core': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./packages/common/.'));

  done();
});

gulp.task('bumpVersion-auth', done => {
  gulp
    .src('./packages/auth/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/core': `^${version}`,
          '@igo2/utils': `^${version}`
        }
      })
    )
    .pipe(gulp.dest('./packages/auth/.'));

  done();
});

gulp.task('bumpVersion-geo', done => {
  gulp
    .src('./packages/geo/package.json')
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
    .pipe(gulp.dest('./packages/geo/.'));

  done();
});

gulp.task('bumpVersion-context', done => {
  gulp
    .src('./packages/context/package.json')
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
    .pipe(gulp.dest('./packages/context/.'));

  done();
});

gulp.task('bumpVersion-integration', done => {
  gulp
    .src('./packages/integration/package.json')
    .pipe(
      jeditor({
        version: version,
        peerDependencies: {
          '@igo2/geo': version,
          '@igo2/context': version
        }
      })
    )
    .pipe(gulp.dest('./packages/integration/.'));

  done();
});

gulp.task(
  'bumpVersion',
  gulp.parallel([
    'bumpVersion-utils',
    'bumpVersion-core',
    'bumpVersion-common',
    'bumpVersion-auth',
    'bumpVersion-geo',
    'bumpVersion-context',
    'bumpVersion-integration'
  ])
);
