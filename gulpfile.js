/* global require */

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gulpIf = require('gulp-if');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var del = require('del');
var fs = require('fs');
var pkg = require('./package.json');

// Assets for the project
var Assets = {
    css: {
        main: './example.scss',
        compiled: './example.css',
        source: './',
    },
    js: {
        main: './jquery.squirrel.js',
        minified: './jquery.squirrel.min.js',
        source: './',
    },
    package: './package.json',
};

// See the sass documentation for more details
var _sassSettings = {
    // Options are 'nested', 'compact', 'compressed', 'expanded'
    outputStyle: 'compressed',
};

// See the uglify documentation for more details
var _uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        /* jscs: disable */
        dead_code: true,
        drop_console: true,
        /* jscs: enable */
        unsafe: true,
        unused: true,
    },
};

// Clean the current directory
gulp.task('clean', function clesnTask(cb) {
    del([Assets.js.minified], cb);
});

// Check the main js file(s) meets the following standards outlined in .eslintrc
gulp.task('eslint', function esLintTask() {
    // Has ESLint fixed the file contents?
    function isFixed(file) {
        return file.eslint !== undefined && file.eslint !== null && file.eslint.fixed;
    }

    return gulp.src(Assets.js.main)
        .pipe(eslint({
            fix: true,
            useEslintrc: '.eslintrc',
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest(Assets.js.source)));
});

// Prettify the main js file
gulp.task('prettify-js', function prettifyJSTask() {
    gulp.src(Assets.js.main)
        .pipe(prettify({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE',
        }))
        .pipe(gulp.dest(Assets.js.source));
});

// Compile the main scss (sass) stylesheet
gulp.task('sass', function sassTask() {
    return gulp.src(Assets.css.main)
        .pipe(sass(_sassSettings))
        .pipe(rename(Assets.css.compiled))
        .pipe(gulp.dest(Assets.css.source));
});

// Uglify aka minify the main js file
gulp.task('uglify', function uglifyTask() {
    return gulp.src(Assets.js.main)
        .pipe(uglify(_uglifySettings))
        .pipe(rename(Assets.js.minified))
        .pipe(gulp.dest(Assets.js.source));
});

// Update version numbers based on the main file version comment
gulp.task('version', function versionTask() {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var reVersion = /(?:(\n\s*\*\s+Version:\s+)(?:\d+\.){2}\d+)/;

    // Update the main js file version number
    return gulp.src(Assets.js.main)
        .pipe(replace(reVersion, '$1' + pkg.version))
        .pipe(gulp.dest(Assets.js.source));
});

// Register the default task
gulp.task('build', ['eslint', 'sass', 'version', 'clean', 'uglify']);

// Watch for changes to the js and scss files
gulp.task('default', function defaultTask() {
    gulp.watch(Assets.css.main, ['sass']);
    gulp.watch(Assets.js.main, ['version', 'eslint', 'clean', 'uglify']);
});

// 'gulp build' to invoke all tasks above
// 'gulp eslint' to check the syntax of the main js file
// 'gulp prettify-js' to prettify the main js file
// 'gulp sass' to compile the main scss (sass) file
// 'gulp uglify' to uglify the main js file
// 'gulp version' to update the version numbers based on the main js file version comment
