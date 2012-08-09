// test-jsonparse.js

var jsonparse = require('../lib/jsonparse')

exports.testTopLevel = testTopLevel

function testTopLevel(test) {
	var values = {
		'undefined': undefined,
		'null': null,
		'false': false,
		'true': true,
		'Empty String' : '',
		'0': 0,
		'1': 1,
		'NaN': NaN,
		'Infinity': Infinity,
		'whitespace': ' \n \r \t ',
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
console.log('invoking jsonparse')
		var actual = jsonparse.parse(input)
console.log('jsonparse done', typeof actual, actual)
		test.equal(typeof expected, typeof actual, 'Result types different: JSON:' + typeof expected + ' jsonparse:' + typeof actual)
		if (!(expected instanceof Error)) test.deepEqual(expected, actual)
else console.log('jsonparse error message:', actual.toString())

console.log()
	}

	test.done()
}