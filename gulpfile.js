var gulp = require('gulp'),
    sass = require('gulp-sass'),
    // sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    minifycss = require('gulp-minify-css'),
    jsonminify = require('gulp-jsonminify'),
    rename = require('gulp-rename'),
    // jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    zip = require('gulp-zip'),
    babel = require('gulp-babel');

var getDateString = function(){
  
  var date = new Date(),
      day = date.getDate(),
      month = date.getMonth()+1,
      year = date.getFullYear();

  return (day+'_'+month+'_'+year);

}

function styles() {
  return gulp.src('badmin/styles/*.scss', { style: 'expanded' })
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('badmin/dist/badmin/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('badmin/dist/badmin/css'));
    // .pipe(notify({ message: 'Styles task complete' }));
}

// gulp.task('styles2', function() {
//   return sass('badmin/styles/init.scss', { style: 'expanded' })
//     .pipe(sass().on('error', sass.logError))
//     .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
//     .pipe(gulp.dest('badmin/dist/badmin/css'))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(minifycss())
//     .pipe(gulp.dest('badmin/dist/badmin/css'));
//     // .pipe(notify({ message: 'Styles2 task complete' }));
// });

function scripts(cb) {
  // return gulp.src(['badmin/src/*.js'])
  gulp.src('badmin/src/*.js')
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('badmin/dist/badmin/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('badmin/dist/badmin/js'))
    .pipe(notify({ message: 'Scripts task complete' }));

    cb();
}

function components(cb) {
  gulp.src(['badmin/components/**/*.jsx'])
    // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['react']
    }))
    .pipe(concat('components.js'))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('badmin/dist/badmin/js'))
    .pipe(notify({ message: 'Components task complete' }));

    cb();
}

function publicComponents(cb) {
  gulp.src('public/components/**/*.jsx')
    // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['react']
    }))
    .pipe(concat('components.js'))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('badmin/dist/public/scripts'))

    cb()
}

function zip(cb) {
  gulp.src('badmin/dist/**')
    .pipe(zip('webadmin_'+getDateString()+'.zip')).
    pipe(gulp.dest('./archives'));

    cb()
}

// gulp.task('flot', function() {
//   return gulp.src('badmin/src/vendors/flot/*.js')
//     .pipe(concat('flot.all.js'))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(uglify())
//     .pipe(gulp.dest('badmin/dist/badmin/js/vendors'));
//     // .pipe(notify({ message: 'Flot task complete' }));
// });

// gulp.task('flatpickr', function() {
//   return gulp.src('badmin/src/vendors/flatpickr/*.js')
//     .pipe(concat('flatpickr.all.js'))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(uglify())
//     .pipe(gulp.dest('badmin/dist/badmin/js/vendors'));
//     // .pipe(notify({ message: 'Flatpickr task complete' }));
// });

function views(cb) {
  gulp.src('badmin/branch.html')
  .pipe(gulp.dest('badmin/dist/badmin/'));

  gulp.src(['*.html', '*.ico', 'init.js'])
  .pipe(gulp.dest('badmin/dist/'));

  gulp.src(['public/**/*', '!public/{components,components/*}'])
  .pipe(gulp.dest('badmin/dist/public/'));

  gulp.src('badmin/views/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/views/'));

  gulp.src('badmin/partials/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/partials/'));

  gulp.src('badmin/src/vendors/*.js')
  .pipe(gulp.dest('badmin/dist/badmin/js/vendors/'));

  gulp.src('badmin/styles/vendors/*.css')
  .pipe(gulp.dest('badmin/dist/badmin/css/vendors/'));

  gulp.src('badmin/translations/*.json')
  .pipe(jsonminify())
  .pipe(gulp.dest('badmin/dist/badmin/translations/'));

  gulp.src('badmin/fonts/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/fonts/'));

  gulp.src('badmin/images/**/*')
  .pipe(gulp.dest('badmin/dist/badmin/images/'));

  cb()
}

function clean(cb) {
    del(['badmin/dist/badmin/**', 'badmin/dist/badmin/css', 'badmin/dist/badmin/js'], cb);
}

exports.styles = styles;
exports.scripts = scripts;
exports.components = components;
exports.publicComponents = publicComponents;
exports.views = views;
exports.zip = zip;

