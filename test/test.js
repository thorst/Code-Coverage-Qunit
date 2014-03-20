(function($) {
/*
		======== A Handy Little QUnit Reference ========
		http://docs.jquery.com/QUnit

		Test methods:
			expect(numAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			raises(block, [expected], [message])
*/
    //Name | expects | test
	
	
	module("Test only add");
	
	test("Test Add", 2, function () {
		$("#qunit-fixture").html($.simpleAdd(1,2));
		equal(typeof $.simpleAdd(1,2), "number", "Add type should be a number");
		equal($.simpleAdd(1,2), 3, "Add Works");
		
	});

	/*test("Test Add", 2, function () {
		$("#qunit-fixture").html($.simpleSubtract (1,2));
		equal(typeof $.simpleSubtract (1,2), "number", "Add type should be a number");
		equal($.simpleSubtract (1,2), -1, "Add Works");
		
	});
	
	test("Test Add", 2, function () {
		$("#qunit-fixture").html($.simpleMultiply (1,2));
		equal(typeof $.simpleMultiply (1,2), "number", "Add type should be a number");
		equal($.simpleMultiply (1,2), 2, "Add Works");
		
	});*/

}(jQuery));
