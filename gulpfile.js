var gulp = require('gulp'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch'),
  src = ['css/*.css', 'js/*.js' , './*.html'],
  webp = require('gulp-webp');
  const minify = require('gulp-minify');
  let cleanCSS = require('gulp-clean-css');


gulp.task('webserver', function () {
  connect.server({
    livereload: true,
    root: ['./'],
    port:8000
  });
});

gulp.task('minify-css', () => {
  return gulp.src('styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress', function() {
  gulp.src(['js/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});


gulp.task('livereload', function () {
  gulp.src(src)
    .pipe(watch(src))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('js/*.js');
  gulp.watch('./*.js');
  gulp.watch('styles/*.css');
});

gulp.task('default', ['minify-css','compress','webserver', 'livereload', 'watch']);
