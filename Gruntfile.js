"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON("simple.jquery.json"),
    banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
      "<%= grunt.template.today('yyyy-mm-dd') %>\n" +
      "<%= pkg.homepage ? '* ' + pkg.homepage + '\\n' : '' %>" +
      "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
      " Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */\n",
    // Task configuration.
    concat: {
      options: {
        banner: "<%= banner %>",
        stripBanners: true
      },
      dist: {
          files: [
                {
                    src: ["src/<%= pkg.name %>.js"],
                    dest: "dist/<%= pkg.name %>.js"
                },
                {
                    src: ["src/<%= pkg.name %>.js"],
                    dest: "dist/<%= pkg.name %>.<%= pkg.version %>.js"
                }
          ]
      },
    },
    uglify: {
      options: {
        banner: "<%= banner %>"
      },
      dist: {
          files: [
                {
                    src: "<%= concat.dist.files[0].dest %>",
                    dest: "dist/<%= pkg.name %>.min.js"
                },
                {
                    src: "<%= concat.dist.files[0].dest %>",
                    dest: "dist/<%= pkg.name %>.<%= pkg.version %>.min.js"
                }
          ]
      },
    },
    qunit: {
		options: {
			timeout: 30000,
			"--web-security": "no",
			coverage: {
				src: [ "src/<%= pkg.name %>.js" ],
				instrumentedFiles: "temp/",
				coberturaReport: "report/",
				htmlReport: "build/report/coverage",
				lcovReport: "build/report/lcov",
				linesThresholdPct: 70
			}
		},
      files: ["test/**/*.html"]
    },
    coveralls: {
    options: {
      // LCOV coverage file relevant to every target
      src: "coverage-results/lcov.info",

      // When true, grunt-coveralls will only print a warning rather than
      // an error, to prevent CI builds from failing unnecessarily (e.g. if
      // coveralls.io is down). Optional, defaults to false.
      force: false
    },
    your_target: {
      // Target-specific LCOV coverage file
      src: "coverage-results/extra-results-*.info"
    },
    grunt_coveralls_real_coverage: {
                src: "coverage/lcov.info"
            }
  },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: ".jshintrc"
        },
        src: "Gruntfile.js"
      },
      src: {
        options: {
          jshintrc: "src/.jshintrc"
        },
        src: ["src/**/*.js"]
      },
      test: {
        options: {
          jshintrc: "test/.jshintrc"
        },
        src: ["test/**/*.js"]
      },
    },
    watch: {
      gruntfile: {
        files: "<%= jshint.gruntfile.src %>",
        tasks: ["jshint:gruntfile"]
      },
      src: {
        files: "<%= jshint.src.src %>",
        tasks: ["jshint:src", "qunit"]
      },
      test: {
        files: "<%= jshint.test.src %>",
        tasks: ["jshint:test", "qunit"]
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-qunit-istanbul");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Default task.
  grunt.registerTask("default", ["jshint", "qunit", "concat", "uglify"]);

};
