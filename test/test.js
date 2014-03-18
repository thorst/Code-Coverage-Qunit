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

	

}(jQuery));
