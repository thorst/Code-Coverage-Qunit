/*
 * grunt-contrib-qunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Nodejs libs.
  var path = require('path');
  var fs = require('fs');

  // External lib.
  var phantomjs = require('grunt-lib-phantomjs-istanbul').init(grunt);
  var istanbul = require('istanbul');
  var instrumenter = new istanbul.Instrumenter();
  var collector = new istanbul.Collector();
  var rimraf = require('rimraf');

  // Keep track of the last-started module, test and status.
  var options, currentModule, currentTest, status;
  // Keep track of the last-started test(s).
  var unfinished = {};
  // Get temp file path for covarage
  var tempFileCoverage = path.normalize(__dirname + '/../temp/coverage.tmp');
  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

  // Allow an error message to retain its color when split across multiple lines.
  var formatMessage = function(str) {
    return String(str).split('\n').map(function(s) { return s.magenta; }).join('\n');
  };

  // If options.force then log an error, otherwise exit with a warning
  var warnUnlessForced = function (message) {
    if (options && options.force) {
      grunt.log.error(message);
    } else {
      grunt.warn(message);
    }
  };

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  var logFailedAssertions = function() {
    var assertion;
    // Print each assertion error.
    while (assertion = failedAssertions.shift()) {
      grunt.verbose.or.error(assertion.testName);
      grunt.log.error('Message: ' + formatMessage(assertion.message));
      if (assertion.actual !== assertion.expected) {
        grunt.log.error('Actual: ' + formatMessage(assertion.actual));
        grunt.log.error('Expected: ' + formatMessage(assertion.expected));
      }
      if (assertion.source) {
        grunt.log.error(assertion.source.replace(/ {4}(at)/g, '  $1'));
      }
      grunt.log.writeln();
    }
  };

  var checkCodeCoverage = function(threshold, value, printName) {
    if(threshold && value < threshold) {
      grunt.warn('Code coverage for ' + printName + ' was below threshold (' + value + '% < ' + threshold + '%)');
    }
  };

  // QUnit hooks.
  phantomjs.on('qunit.moduleStart', function(name) {
    unfinished[name] = true;
    currentModule = name;
  });

  phantomjs.on('qunit.moduleDone', function(name/*, failed, passed, total*/) {
    delete unfinished[name];
  });

  phantomjs.on('qunit.log', function(result, actual, expected, message, source) {
    if (!result) {
      failedAssertions.push({
        actual: actual, expected: expected, message: message, source: source,
        testName: currentTest
      });
    }
  });

  phantomjs.on('qunit.testStart', function(name) {
    currentTest = (currentModule ? currentModule + ' - ' : '') + name;
    grunt.verbose.write(currentTest + '...');
  });

  phantomjs.on('qunit.coverage', function(coverage) {
    if (coverage) {
      // add coverage information to the collector
      collector.add(coverage);
    }
  });

  phantomjs.on('qunit.testDone', function(name, failed/*, passed, total*/) {
    // Log errors if necessary, otherwise success.
    if (failed > 0) {
      // list assertions
      if (grunt.option('verbose')) {
        grunt.log.error();
        logFailedAssertions();
      } else {
        grunt.log.write('F'.red);
      }
    } else {
      grunt.verbose.ok().or.write('.');
    }
  });

  phantomjs.on('qunit.done', function(failed, passed, total, duration) {
    phantomjs.halt();
    status.failed += failed;
    status.passed += passed;
    status.total += total;
    status.duration += duration;
    // Print assertion errors here, if verbose mode is disabled.
    if (!grunt.option('verbose')) {
      if (failed > 0) {
        grunt.log.writeln();
        logFailedAssertions();
      } else if (total === 0) {
        warnUnlessForced('0/0 assertions ran (' + duration + 'ms)');
      } else {
        grunt.log.ok();
      }
    }
  });

  // Re-broadcast qunit events on grunt.event.
  phantomjs.on('qunit.*', function() {
    var args = [this.event].concat(grunt.util.toArray(arguments));
    grunt.event.emit.apply(grunt.event, args);
  });

  // Built-in error handlers.
  phantomjs.on('fail.load', function(url) {
    phantomjs.halt();
    grunt.verbose.write('...');
    grunt.event.emit('qunit.fail.load', url);
    grunt.log.error('PhantomJS unable to load "' + url + '" URI.');
    status.failed += 1;
    status.total += 1;
  });

  phantomjs.on('fail.timeout', function() {
    phantomjs.halt();
    grunt.log.writeln();
    grunt.event.emit('qunit.fail.timeout');
    grunt.log.error('PhantomJS timed out, possibly due to a missing QUnit start() call.');
    status.failed += 1;
    status.total += 1;
  });

  phantomjs.on('error.onError', function (msg, stackTrace) {
    grunt.event.emit('qunit.error.onError', msg, stackTrace);
  });


  // Pass-through console.log statements.
  phantomjs.on('console', console.log.bind(console));

  grunt.registerMultiTask('qunit', 'Run QUnit unit tests in a headless PhantomJS instance.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
      // Default PhantomJS timeout.
      timeout: 5000,
      // QUnit-PhantomJS bridge file to be injected.
      inject: asset('phantomjs/bridge.js'),
      // Explicit non-file URLs to test.
      urls: [],
      force: false,
      // Explicitly define all coverage options (as empty)
      coverage: {
        src: []
      }
    });

    // Combine any specified URLs with src files.
    var urls = options.urls.concat(this.filesSrc);

    // This task is asynchronous.
    var done = this.async();

    // Reset status.
    status = {failed: 0, passed: 0, total: 0, duration: 0, coverage: '-'};

    // expand files for coverage
    if (options.coverage && options.coverage.src && options.coverage.src.length) {
        options.coverage.include = grunt.file.expand(options.coverage.src);
        var instrumentedFiles = {};
    }

    grunt.util.async.forEachSeries(options.coverage.include, function (file, cb) {
      var filepath = fs.realpathSync(file);
      var fileStorage = filepath;

      // check if files will be delivered by a webserver
      if (options.urls && options.coverage && options.coverage.baseUrl) {
        fileStorage = path.relative(options.coverage.baseUrl, filepath);
      }else{ //delivered via file - normalize file storage
    		//files never have a domain hence allways start with /
    		fileStorage = fileStorage.replace(/^\/?/g, "/");
    		//all \ are replaced
    		fileStorage = fileStorage.replace(/\\/g, "/");
	    }

      // instrument the files that should be processed by istanbul
      if (options.coverage && options.coverage.instrumentedFiles) {
        instrumentedFiles[fileStorage] = instrumenter.instrumentSync(String(fs.readFileSync(filepath)), filepath);
      }

      cb();
    }, function (err, result) {
        // set transport options
        if (!options.transport) {
          options.transport = {};
        }

        // clear instrumented files folder & generate a new one
        if (options.coverage && options.coverage.instrumentedFiles) {
          if (!fs.existsSync(options.coverage.instrumentedFiles)) {
            grunt.file.mkdir(options.coverage.instrumentedFiles);
            options.transport.instrumentedFiles = options.coverage.instrumentedFiles;
          } else {
            options.transport.instrumentedFiles = fs.realpathSync(options.coverage.instrumentedFiles);
            rimraf.sync(options.transport.instrumentedFiles);
          }
        }

        // write instrumented file information to an temporary file
        // and transport the info to phantom
        if (options.coverage && options.coverage.instrumentedFiles) {
          grunt.file.write(tempFileCoverage, JSON.stringify(instrumentedFiles));
          options.transport.coverage = fs.realpathSync(tempFileCoverage);
        }

        // Process each filepath in-order.
        grunt.util.async.forEachSeries(urls, function(url, next) {
          var basename = path.basename(url);
          grunt.verbose.subhead('Testing ' + url + ' ').or.write('Testing ' + url + ' ');

          // Reset current module.
          currentModule = null;

          // Launch PhantomJS.
          grunt.event.emit('qunit.spawn', url);
          phantomjs.spawn(url, {
            // Additional PhantomJS options.
            options: options,
            // Do stuff when done.
            done: function(err) {
              if (err) {
                // If there was an error, abort the series.
                done();
              } else {
                // Otherwise, process next url.
                next();
              }
            },
          });
        },
        // All tests have been run.
        function() {
          // Log results.
          if (status.failed > 0) {
            warnUnlessForced(status.failed + '/' + status.total +
                ' assertions failed (' + status.duration + 'ms)');
          } else if (status.total === 0) {
            warnUnlessForced('0/0 assertions ran (' + status.duration + 'ms)');
          } else {
            grunt.verbose.writeln();
            grunt.log.ok(status.total + ' assertions passed (' + status.duration + 'ms)');

            // store coverage data for cmd output
            status.coverage = istanbul.utils.summarizeCoverage(collector.getFinalCoverage());

            // check if coverage was enable during the testrun
            if (status.coverage && status.coverage.lines) {
              var Report = istanbul.Report;
              var coverageOptions = options.coverage;

              // check if a html report should be generated
              if (coverageOptions.htmlReport) {
                Report.create('html', {dir: coverageOptions.htmlReport}).writeReport(collector, true);
              }

              // check if a cobertura report should be generated
              if (coverageOptions.coberturaReport) {
                Report.create('cobertura', {dir: coverageOptions.coberturaReport}).writeReport(collector, true);
              }

              // check if a lcov report should be generated
              if (coverageOptions.lcovReport) {
                Report.create('lcov', {dir: coverageOptions.lcovReport}).writeReport(collector, true);
              }

              // delete the instrumented files
              rimraf.sync(options.transport.instrumentedFiles);

              grunt.log.ok('Coverage:');
              grunt.log.ok('-  Lines: ' + status.coverage.lines.pct + '%');
              grunt.log.ok('-  Statements: ' + status.coverage.statements.pct + '%');
              grunt.log.ok('-  Functions: ' + status.coverage.functions.pct + '%');
              grunt.log.ok('-  Branches: ' + status.coverage.branches.pct + '%');

              checkCodeCoverage(options.coverage.linesThresholdPct, status.coverage.lines.pct, 'lines');
              checkCodeCoverage(options.coverage.statementsThresholdPct, status.coverage.statements.pct, 'statements');
              checkCodeCoverage(options.coverage.functionsThresholdPct, status.coverage.functions.pct, 'functions');
              checkCodeCoverage(options.coverage.branchesThresholdPct, status.coverage.branches.pct, 'branches');
            }
          }
          // All done!
          done();
        });
      });
    });

};
