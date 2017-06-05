// Gulp utils
var gulp = require('gulp-help')(require('gulp'));
var u = require('gulp-util');
var log = u.log;
var c = u.colors;
var spawn = require('child_process').spawn;
var plumber = require('gulp-plumber');
var sequence = require('run-sequence');
var parallel = require('concurrent-transform');
var os = require('os');

// Include Our Plugins
var bs = require('browser-sync');
var reload = bs.reload;
var less = require('gulp-less');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Deployment debugging
log(c.yellow('Detected environment: ' + (process.env.NODE_ENV || 'local')));

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
  ' */\n',
  ''
].join('');

// -----------------------------------------------------------------------------
// Default task — builds site for development
// -----------------------------------------------------------------------------
gulp.task('default', ['less', 'css', 'js', 'copy', 'jekyll']);

// -----------------------------------------------------------------------------
// Less processing
// -----------------------------------------------------------------------------
gulp.task('less', function() {
  return gulp.src('less/freelancer.less')
    .pipe(less())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css'))
    .pipe(bs.reload({
      stream: true
    }))
});

// -----------------------------------------------------------------------------
// CSS processing
// -----------------------------------------------------------------------------
gulp.task('css', function() {
  return gulp.src('css/freelancer.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(bs.reload({
      stream: true
    }))
});

// -----------------------------------------------------------------------------
// JS processing
// -----------------------------------------------------------------------------
gulp.task('js', function() {
  return gulp.src('js/freelancer.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(bs.reload({
      stream: true
    }))
});

// -----------------------------------------------------------------------------
// Copy Bootstrap core files from node_modules to vendor directory
// -----------------------------------------------------------------------------
gulp.task('bootstrap', function() {
  return gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
    .pipe(gulp.dest('vendor/bootstrap'))
})

// -----------------------------------------------------------------------------
// Copy jQuery core files from node_modules to vendor directory
// -----------------------------------------------------------------------------
gulp.task('jquery', function() {
  return gulp.src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jquery/dist/jquery.min.js'
    ])
    .pipe(gulp.dest('vendor/jquery'))
})

// -----------------------------------------------------------------------------
// Copy Font Awesome core files from node_modules to vendor directory
// -----------------------------------------------------------------------------
gulp.task('fontawesome', function() {
  return gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'))
})

// -----------------------------------------------------------------------------
// Copy all third party dependencies from node_modules to vendor directory
// -----------------------------------------------------------------------------
gulp.task('copy', ['bootstrap', 'jquery', 'fontawesome']);

// -----------------------------------------------------------------------------
// Jekyll
// -----------------------------------------------------------------------------
gulp.task('jekyll', 'Compiles Jekyll site in dev mode.', function() {
  bs.notify('Jekyll building...');
  return spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config.dev.yml', '--drafts'], {stdio: 'inherit'})
    .on('close', reload);
});

// -----------------------------------------------------------------------------
// bs
// -----------------------------------------------------------------------------
gulp.task('browser-sync', function() {
  bs.init({
    server: {
      baseDir: ''
    },
  })
})

// -----------------------------------------------------------------------------
// Watch files for development
// -----------------------------------------------------------------------------
gulp.task('dev', ['browser-sync', 'less', 'css', 'js'], function() {
  gulp.watch('less/*.less', ['less']);
  gulp.watch('css/*.css', ['css']);
  gulp.watch('js/**/*.js', ['js']);
  gulp.watch(['**/*.html', '!_site/**/*.*'], ['jekyll']);
});
