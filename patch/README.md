If you want to debug on windows, you will just get 100% even though some code isnt covered.
Replace these two files and run it again and itll work

node_modules\grunt-qunit-istanbul\tasks\qunit.js

node_modules\grunt-qunit-istanbul\node_modules\grunt-lib-phantomjs-istanbul\phantomjs\main.js

you can read more here https://github.com/asciidisco/grunt-qunit-istanbul/pull/12