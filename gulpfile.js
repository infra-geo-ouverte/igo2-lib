var gulp = require('gulp');
var replace = require('gulp-replace');
var stylus = require('gulp-stylus');


gulp.task('copyHtml', () => {
   gulp.src('./lib/src/**/*.html')
      .pipe(gulp.dest('./lib/dist'));
});

gulp.task('copyTs', () => {
   gulp.src('./lib/src/**/*.ts')
      .pipe(replace(/styleUrls: \[(\'\.\/|\')(.*?)\.styl\'\]/g, 'styleUrls: [\'$2.css\']'))
      .pipe(gulp.dest('./lib/dist'));
});

gulp.task('copyStylus', () => {
   gulp.src('./lib/src/**/*.styl')
      .pipe(stylus())
      .pipe(gulp.dest('./lib/dist'));
});

gulp.task('default', ['copyHtml', 'copyTs', 'copyStylus']);
