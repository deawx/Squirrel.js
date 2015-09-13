/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var del = require('del');
var fs = require('fs');

// See the saas documentation for more details
var saasSettings = {
    // Options are 'nested', 'compact', 'compressed', 'expanded'
    outputStyle: 'compressed'
};

// See the uglify documentation for more details
var uglifySettings = {
    compress: {
        comparisons: true,
        conditionals: true,
        dead_code: true,
        drop_console: true,
        unsafe: true,
        unused: true
    }
};

// Assets for the project
var Assets = {
    css: {
        main: 'example.scss',
        compiled: 'example.css'
    },
    js: {
        main: 'jquery.squirrel.js',
        minified: 'jquery.squirrel.min.js'
    },
    package: 'package.json'
};

// Clean the current directory
gulp.task('clean', function (cb) {
    del([Assets.js.minified], cb);
});

// Check the main js file meets the following standards outlined in .jshintrc
gulp.task('jshint', function () {
    return gulp.src('./' + Assets.js.main)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
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
        .pipe(sass(saasSettings))
        .pipe(rename(Assets.css.compiled))
        .pipe(gulp.dest('./'));
});

// Uglify aka minify the main js file
gulp.task('uglify', function () {
    return gulp.src('./' + Assets.js.main)
        .pipe(uglify(uglifySettings))
        .pipe(rename(Assets.js.minified))
        .pipe(gulp.dest('./'));
});

// Update version numbers based on the main file version comment
gulp.task('version', function () {
    // SemVer matching is done using (?:\d+\.){2}\d+

    var reVersion = /\n\s*\*\s+Version:\s+((?:\d+\.){2}\d+)/;
    var version = fs.readFileSync('./' + Assets.js.main, {
            encoding: 'utf8'
        })
        // Match is found in the 2nd element
        .match(reVersion)[1];

    // package.json version property
    return gulp.src('./' + Assets.package)
        .pipe(replace(/"version":\s+"(?:\d+\.){2}\d+",/, '"version": "' + version + '",'))
        .pipe(gulp.dest('./'));
});

// Register the default task
gulp.task('build', ['jshint', 'saas', 'version', 'clean', 'uglify', 'prettify-js']);

// Watch for changes to the js and scss files
gulp.task('default', function () {
    gulp.watch('./' + Assets.css.main, ['saas']);
    gulp.watch('./' + Assets.js.main, ['version', 'jshint', 'clean', 'uglify']);
});

// 'gulp build' to invoke all tasks above
// 'gulp jshint' to check the syntax of the main js file
// 'gulp prettify-js' to prettify the main js file
// 'gulp saas' to compile the main scss (saas) file
// 'gulp uglify' to uglify the main js file
// 'gulp version' to update the version numbers based on the main js file version comment
