var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    // jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    zip = require('gulp-zip');

var getDateString = function(){
  
  var date = new Date(),
      day = date.getDate(),
      month = date.getMonth()+1,
      year = date.getFullYear();

  return (day+'_'+month+'_'+year);

}

gulp.task('styles', function() {
  return sass('badmin/styles/main.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('badmin/dist/badmin/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('badmin/dist/badmin/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('styles2', function() {
  return sass('badmin/styles/init.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('badmin/dist/badmin/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('badmin/dist/badmin/css'))
    .pipe(notify({ message: 'Styles2 task complete' }));
});

gulp.task('scripts', function() {
  return gulp.src(['badmin/src/*.js', '!badmin/src/helper.js'])
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('badmin/dist/badmin/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('badmin/dist/badmin/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('zip', function() {
  return gulp.src('badmin/dist/**')
    .pipe(zip('webadmin_'+getDateString()+'.zip')).
    pipe(gulp.dest('./archives'));
});

gulp.task('flot', function() {
  return gulp.src('badmin/src/vendors/flot/*.js')
    .pipe(concat('flot.all.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('badmin/dist/badmin/js/vendors'))
    .pipe(notify({ message: 'Flot task complete' }));
});

gulp.task('views', function() {
  gulp.src('badmin/branch.html')
  .pipe(gulp.dest('badmin/dist/badmin/'));

  gulp.src('*.html')
  .pipe(gulp.dest('badmin/dist/'));

  gulp.src('*.ico')
  .pipe(gulp.dest('badmin/dist/'));

  gulp.src('init.js')
  .pipe(gulp.dest('badmin/dist/'));

  gulp.src('badmin/views/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/views/'));

  gulp.src('badmin/partials/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/partials/'));

  gulp.src('badmin/src/vendors/*.js')
  .pipe(gulp.dest('badmin/dist/badmin/js/vendors/'));

  gulp.src('badmin/styles/vendors/*.css')
  .pipe(gulp.dest('badmin/dist/badmin/css/vendors/'));

  gulp.src('badmin/translations/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/translations/'));

  gulp.src('badmin/fonts/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/fonts/'));

  gulp.src('badmin/images/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/images/'));
});

gulp.task('clean', function(cb) {
    del(['badmin/dist/badmin/**', 'badmin/dist/badmin/css', 'badmin/dist/badmin/js'], cb);
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'styles2', 'scripts', 'views', 'flot');
});

gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('badmin/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('badmin/src/**/*.js', ['scripts']);

});