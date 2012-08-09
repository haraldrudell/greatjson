// parseutil.js
// helper functions for jsonparse
// written by Harald Rudell in August, 2012

// http://nodejs.org/docs/latest/api/util.html
var util = require('util')

exports.createError = createError

// determine printable characters
var printable = /[ -&(-Za-z]/

// create an elaborate SyntaxError object
// message: string: cause of error
// expected: string: the type of token that json syntax expects
// text: string: the complete input json string
// unparsed: string: the remaining portion of text that could no be parsed
function createError(message, expected, text, unparsed) {
	var result

	var printable = printableCharacters(unparsed.substring(0, 20))
	var textMsg = printable.length ? ', text:\'' + printable + '\'' : ''
	var position = text.length - unparsed.length
	var lineColumn = getLineColumn(text, position)
	var percent = (text.length == 0 ? 0 : position / text.length *100).toFixed(0)
	var msg = util.format('%s: expected %s%s at line:%d column:%d position: %d (%d%%)',
		message,
		expected,
		textMsg,
		lineColumn.line,
		lineColumn.column,
		position,
		percent)
	result = SyntaxError(msg)
	result.position = position
	result.line = lineColumn.line
	result.column = lineColumn.column
	result.text = printable

	return result
}

// get the line and column numbers for position in text
// text: string
// position: index in text
// note: a line break is '/n' or '/r/n' or '/r'
function getLineColumn(text, position) {
	var result = {
		line: 1,
		column: 0,
	}

	var n
	var r
	var lastColumn1 = 0
	for (;;) {

		// find next '/n' and '/r'
		if (n == null && (n = text.indexOf('/n', lastColumn1)) >= position) n = -1
		if (r == null && (r = text.indexOf('/n', lastColumn1)) >= position) r = -1
		if (n == -1 && r == -1) break

		// check if next linebreak is '/n'
		if (n != -1 && n < r) {
			result.line++
			lastColumn1 = n + 1
			n = null
		} else if (r != -1 && r < n) {
			result.line++
			lastColumn1 = r + 1
			if (n == r + 1) {
				n = null
				lastColumn1++
			}
			r = null
		}
	}
	result.column = position - lastColumn1 + 1

	return result
}

// replace unprintable characters in input with '.'
// result: string
function printableCharacters(input) {
	var result = ''
	for (var index in input) {
		var char = input[index]
		result += printable.test(char) ? char : '.'
	}
	return result
}