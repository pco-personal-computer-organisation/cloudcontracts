// Karma configuration
// Generated on Mon Feb 15 2016 15:33:19 GMT+0100 (CET)

module.exports = (config) => {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'client',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/datatables/media/js/jquery.dataTables.js',
      'bower_components/moment/moment.js',
      'bower_components/**/*.js',
      'js/app.js',
      'js/*.js',
      '../tests/frontend/*.js',
    ],

    // list of files to exclude
    exclude: [
      // exclude minified versions, better for debugging
      '**/*.min.js',

      // exclude 'special' files
      '**/index.js',
      '**/karma.conf.js',
      '**/Gruntfile.js',
      '**/npm.js',
      '**/changelog.js',
      '**/gulpfile.js',
      '**/grunt/**/*.js',
      '**/package.js',
      '**/gulpfile.babel.js',
      'bower_components/angular-mocks/ng*.js',

      // exclude some dirs completely
      '**/docs/**/*.js',
      '**/src/**/*.js',
      '**/lib/**/*.js',
      '**/test/**/*.js',
      '**/min/**/*.js',
      '**/templates/**/*.js',
      '**/spec/**/*.js', // morrisjs
      '**/dev/**/*.js',

      // exclude some special cases
      'bower_components/angular-i18n/**/*.js',
      'bower_components/async/*/**/*.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8080,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    //    config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
