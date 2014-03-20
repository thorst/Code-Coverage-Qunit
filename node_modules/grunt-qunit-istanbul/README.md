# grunt-qunit-istanbul
> Run QUnit unit tests in a headless PhantomJS instance withn code coverage analysis provided by istanbul.

# IMPORTANT
This is a fork of the grunt-contrib-qunit repo.
I added the ability to generate [istanbul](http://gotwarlost.github.com/istanbul/) based test coverage reports.
Unfortunately this couldn' be handled as a seperate plugin, because we need to hook in
deeper into grunt-contrib-qunit & grunt-lib-phantomjs structure :(

This plugin should work as a drop in replacement for your current `qunit` task,
for any further configuration, please check out the [original plugin's repo](https://github.com/gruntjs/grunt-contrib-qunit).


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-qunit-istanbul --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-qunit-istanbul');
```

## Qunit task
_Run this task with the `grunt qunit` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

When installed by npm, this plugin will automatically download and install [PhantomJS][] locally via the [grunt-lib-phantomjs-istanbul][] library.

[PhantomJS]: http://www.phantomjs.org/
[grunt-lib-phantomjs-istanbul]: https://github.com/asciidisco/grunt-lib-phantomjs-istanbul

Also note that running grunt with the `--debug` flag will output a lot of PhantomJS-specific debugging information. This can be very helpful in seeing what actual URIs are being requested and received by PhantomJS.

#### OS Dependencies
This plugin uses PhantomJS to run tests. PhantomJS requires these dependencies

**On Ubuntu/Debian**

`apt-get install libfontconfig1 fontconfig libfontconfig1-dev libfreetype6-dev`

**On CentOS**

`yum install fontconfig freetype`

### Options (Coverage object)

#### src
Type: `array`
Default: `[]`

The js files you would like to end up in the coverage report.

#### instrumentedFiles
Type: `string`

A temporary folder (that will be automatically generated & deleted after the test suite finishes),
containing the instrumented source code

#### htmlReport
Type: `string`
Optional

A folder where the HTML reports should be stored

#### coberturaReport
Type: `string`
Optional

A folder where the Cobertura reports should be stored

#### lcovReport
Type: `string`
Optional

A folder where the LCOV reports should be stored

#### baseUrl
Type: `string`
Default: `.`
Optional

If you're running your qunit tests with the help of a webserver,
you have to point the coverage inspector to the physical path that
is the base url of the qunit page you're running

#### linesThresholdPct
Type: `number`
Optional

Lines coverage percentage threshold to evaluate when running the build. If the actual
coverage percentage is less than this value, the build will fail.

#### statementsThresholdPct
Type: `number`
Optional

Statements coverage percentage threshold to evaluate when running the build. If the actual
coverage percentage is less than this value, the build will fail.

#### functionsThresholdPct
Type: `number`
Optional

Functions coverage percentage threshold to evaluate when running the build. If the actual
coverage percentage is less than this value, the build will fail.

#### branchesThresholdPct
Type: `number`
Optional

Branches coverage percentage threshold to evaluate when running the build. If the actual
coverage percentage is less than this value, the build will fail.

### Usage

```
    qunit: {
      options: {
        '--web-security': 'no',
        coverage: {
          src: ['src/js/**/*.js'],
          instrumentedFiles: 'temp/',
          htmlReport: 'report/coverage',
          coberturaReport: 'report/',
          linesThresholdPct: 85
        }
      },
      all: ['test/**/*.html']
    }
```

---

Original Task by ["Cowboy" Ben Alman](http://benalman.com/)
Modified by [asciidisco](http://twitter.com/asciidisco)
