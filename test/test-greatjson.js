// test-greatjson.js
// written by Harald Rudell in August, 2012

var greatjson = require('../lib/greatjson')
// http://nodejs.org/docs/latest/api/fs.html
var fs = require('fs')
// http://nodejs.org/api/path.html
var path = require('path')

exports.testParsing = testParsing
exports.testReviver = testReviver
exports.testErrorProperties = testErrorProperties

// check the regexps...
/*
These are pretty to look at
But of course, testParsing will pass if and only if they work!
var regexps = require('../lib/regexps')
console.log('jsonWhitespace:', regexps.jsonWhitespace)
console.log('jsonValue:', regexps.jsonValue)
console.log('jsonString:', regexps.jsonString)
console.log('jsonStringEscapes:', regexps.jsonStringEscapes)
console.log('jsonStringEscapeMap:', regexps.jsonStringEscapeMap)
*/

function testParsing(test) {
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
		'Leading characters': 'zfalse',
		'Trailing characters': 'falsez',
		'Leading whitespace': '  \n  \r  \t  false',
		'Trailing whitespace': 'false  \n  \r  \t  ',
		'string': '  \n  "  z  "  \n  ',
		'array': ' \n [  1  ,  2  ] \n ',
		'Empty array': '[]',
		'object': ' \n {  " 2 " : [ 1 ],  "2":false}',
		'Empty object': '{}',
		'tab in string': '\t"a\tb"\t',
		'float': '[ 1, 1e1, -1E-1, 3.14, 0.5, -0.5, -0e+5]',
		'stringEscapes': ' " \\" \\/ \\\\ \\b \\f \\n \\r \\t " ',
		'hex escapes': ' " \\u0041\\u0062 " ',
	}

	for (var valueName in values) {
//console.log('executing test:' + valueName)
		var input = values[valueName]
		var expected
		try {
			expected = JSON.parse(input)
		} catch (e) {
//console.log(e.toString())
			expected = e
		}
//if (!(expected instanceof Error)) console.log('JSON result:', expected)
		var actual = greatjson.parse(input)
//if (!(actual instanceof Error)) console.log('greatjson result:', typeof actual, actual)
		test.equal(typeof actual, typeof expected, 'Result types different: JSON:' + typeof expected + ' greatjson:' + typeof actual)
		test.equal(actual instanceof Error, expected instanceof Error, 'Result different wether Error: JSON:' + expected + ' greatjson:' + actual)
		if (!(actual instanceof Error)) test.deepEqual(actual, expected)
//else console.log(actual.toString()) // errors from greatjson
//console.log()
	}

	test.done()
}

function testReviver(test) {
	var input = '[ "a", { "b": "c"}]'

	var expected = JSON.parse(input, reviver)
//console.log('JSON', typeof expected, JSON.stringify(expected))
	var actual = greatjson.parse(input, reviver)
//console.log('greatjson', typeof actual, JSON.stringify(actual))
	test.equal(typeof actual, typeof expected, 'Result types different: JSON:' + typeof expected + ' greatjson:' + typeof actual)
	if (!(actual instanceof Error)) test.deepEqual(expected, actual)

	test.done()

	function reviver(property, value) {
//console.log(arguments.callee.name, this, typeof property, property, typeof value, value)
		// delete the property of the object
		if (property == 'b') return undefined
		// add x to the 'a' value
		if (property == '0') return value + 'x'
		return value
	}
}

function testErrorProperties(test) {
	var string = fs.readFileSync(path.join(__dirname, 'data', 'packagex.json'))
	var object = greatjson.parse(string)
	test.ok(object instanceof Error, 'Failed to indicate error in bad package.json test')
//console.log(object.toString())
	var expected = 633
	test.equal(object.position, expected, 'Position property incorrect:' + object.position + ' instead of ' + expected)

	var expected = 17
	test.equal(object.line, expected, 'Line property incorrect:' + object.position + ' instead of ' + expected)

	var expected = 2
	test.equal(object.column, expected, 'Column property incorrect:' + object.column + ' instead of ' + expected)

	var expected = 'z},.."repository" : '
	test.equal(object.text, expected, 'Text property incorrect: \'' + object.text + '\' instead of \'' + expected + '\'')

	test.done()
}