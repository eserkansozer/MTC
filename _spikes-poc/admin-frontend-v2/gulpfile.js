'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const replace = require('gulp-replace')
const winston = require('winston')
require('dotenv').config()

const config = require('./config')

// These files will get uglified and packaged into `app.js`
const jsBundleFiles = [
  './node_modules/govuk-frontend/all.js'
]

gulp.task('watch', function () {
  gulp.watch('./assets/**/*.scss', ['sass'])
  gulp.watch('./assets/**/*.js', ['bundle-js'])
})

gulp.task('bundle-js', function () {
  return gulp.src(jsBundleFiles)
    .pipe(concat('app.js'))
    .pipe(replace('SESSION_DISPLAY_NOTICE_TIME', config.ADMIN_SESSION_DISPLAY_NOTICE_AFTER))
    .pipe(replace('SESSION_EXPIRATION_TIME', config.ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS))
    .pipe(uglify({
      ie8: true
    }).on('error', function (e) {
      winston.error(e)
    }))
    .pipe(gulp.dest('./public/javascripts/'))
})

gulp.task('clean', function () {
  return gulp.src([
    'public/javascripts/app.js',
    'public/stylesheets/application.css',
    'public/stylesheets/application-ie8.css'
  ], { read: false })
    .pipe(clean())
})

gulp.task('copy-images', function () {
  gulp
    .src(['./assets/images/*'])
    .pipe(gulp.dest('public/images'))
})

gulp.task('copy-pdfs', function () {
  gulp
    .src(['./assets/pdfs/*'])
    .pipe(gulp.dest('public/pdfs'))
})

gulp.task('copy-csv-files', function () {
  gulp
    .src(['./assets/csv/*'])
    .pipe(gulp.dest('public/csv'))
})

gulp.task('copy-govuk-js', function () {
  gulp
    .src(['./node_modules/govuk-frontend/all.js'])
    .pipe(gulp.dest('public/javascript/'))
})

gulp.task('realclean', ['clean'], function () {
  return gulp.src('./node_modules', { read: false })
    .pipe(clean())
})

gulp.task('build', ['sass', 'bundle-js', 'copy-images', 'copy-pdfs', 'copy-csv-files'])

gulp.task('sass', function () {
  return gulp.src('./assets/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./public'))
})
