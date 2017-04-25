var gulp = require('gulp');
var replace = require('gulp-replace');
var stylus = require('gulp-stylus');


gulp.task('copyHtml', () => {
   gulp.src('./src/lib/**/*.html')
      .pipe(gulp.dest('./dist/lib'));
});

gulp.task('copyTs', () => {
   gulp.src(['./src/lib/**/*.ts', '!./src/lib/**/*.spec.ts'])
      .pipe(replace(/styleUrls: \[(\'\.\/|\')(.*?)\.styl\'\]/g, 'styleUrls: [\'$2.css\']'))
      .pipe(gulp.dest('./dist/lib'));
});

gulp.task('copyStylus', () => {
   gulp.src('./src/lib/**/*.styl')
      .pipe(stylus())
      .pipe(gulp.dest('./dist/lib'));
});

gulp.task('default', ['copyHtml', 'copyTs', 'copyStylus']);
