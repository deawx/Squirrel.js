/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var del = require('del');

// Assets for the project
var Assets = {
    css: {
        main: 'example.scss',
        compiled: 'example.css'
    },
    js: {
        main: 'jquery.squirrel.js',
        minified: 'jquery.squirrel.min.js'
    }
};

// Clean the current directory
gulp.task('clean', function (cb) {
    del([Assets.js.minified], cb);
});

// Check the main js file meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src('./' + Assets.js.main)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Prettify the main js file
gulp.task('prettify-js', function () {
    gulp.src(Assets.js.main)
        .pipe(prettify({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest('./'));
});

// Compile the main scss (saas) stylesheet
gulp.task('saas', function () {
    return gulp.src(Assets.css.main)
        .pipe(sass({
            // Options are 'nested', 'compact', 'compressed', 'expanded'
            outputStyle: 'compressed'
        }))
        .pipe(rename(Assets.css.compiled))
        .pipe(gulp.dest('./'));
});

// Uglify aka minify the main js file
gulp.task('uglify', ['clean'], function () {
    return gulp.src('./' + Assets.js.main)
        .pipe(uglify({
            // See the uglify documentation for more details
            compress: {
                comparisons: true,
                conditionals: true,
                dead_code: true,
                drop_console: true,
                unsafe: true,
                unused: true
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./'));
});

// Register the default task
gulp.task('build', ['jshint', 'saas', 'uglify']);

// Watch for changes to the js and scss files
gulp.task('default', function () {
    gulp.watch('./' + Assets.css.main, ['saas']);
    gulp.watch('./' + Assets.js.main, ['jshint', 'uglify']);
});

// 'gulp jshint' to check the syntax of the main js file
// 'gulp prettify-js' to prettify the main js file
// 'gulp saas' to compile the main scss (saas) file
// 'gulp uglify' to uglify the main js file
