// test-greatjson.js

var greatjson = require('../lib/greatjson')

exports.testTopLevel = testTopLevel

function testTopLevel(test) {
	var values = {
/*
		'undefined': undefined,
		'null': null,
		'false': false,
		'true': true,
		'Empty String' : '',
		'0': 0,
		'1': 1,
		'NaN': NaN,
		'Infinity': Infinity,
*/
		'whitespace': ' \n \r \t ',
/*
		'zfalse': 'zfalse',
*/
	}

	for (var valueName in values) {
console.log('executing test:' + valueName)
		var input = values[valueName]
		var expected
		try {
			expected = JSON.parse(input)
		} catch (e) {
console.log('note: JSON produced error:\'' + e.toString() + '\'')
			expected = e
		}
if (!(expected instanceof Error)) console.log('note: JSON result:', expected)
console.log('invoking greatjson')
		var actual = greatjson.parse(input)
if (!(actual instanceof Error)) console.log('greatjson done:', typeof actual, actual)
		test.equal(typeof expected, typeof actual, 'Result types different: JSON:' + typeof expected + ' greatjson:' + typeof actual)
		if (!(expected instanceof Error)) test.deepEqual(expected, actual)
else console.log(actual.toString())

console.log()
	}

	test.done()
}