// syntaxerror.js
// elaborate error messages for greatjson
// © Harald Rudell 2012

// http://nodejs.org/api/util.html
var util = require('util')
// https://github.com/haraldrudell/haraldutil
var haraldutil = require('haraldutil')

exports.createError = createError
exports.getPositionString = getPositionString

// create an elaborate SyntaxError object
// message: string: cause of error
// expected: string: the type of token that json syntax expects
// text: string: the complete input json string
// unparsed: string: the remaining portion of text that could no be parsed
function createError(message, expected, text, unparsed) {
	var result

	var printable = unparsed.substring(0, 20)
	var textMsg = printable.length ? ', text:' + haraldutil.inspectDeep(printable) : ''
//console.log('textMsg:(' + textMsg + ')')
	var fields = {}
	var positionString = getPositionString(text, text.length - unparsed.length, fields)
	var msg = util.format('%s: expected %s%s at %s',
		message,
		expected,
		textMsg,
		positionString)
	result = SyntaxError(msg)
//console.log('result.message:(' + result.message + ')')
//console.log('result.test:(' + result.test + ')')
	for (var p in fields) result[p] = fields[p]
	result.text = printable

	return result
}

function getPositionString(text, position, updateObject) {
	var lineColumn = getLineColumn(text, position)
	var percent = (text.length == 0 ? 0 : position / text.length *100).toFixed(0)
	var result = util.format('line:%d column:%d position: %d (%d%%)',
		lineColumn.line,
		lineColumn.column,
		position,
		percent)
	if (updateObject) {
		updateObject.position = position
		updateObject.line = lineColumn.line
		updateObject.column = lineColumn.column
	}
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
		if (n == null && (n = text.indexOf('\n', lastColumn1)) >= position) n = -1
		if (r == null && (r = text.indexOf('\r', lastColumn1)) >= position) r = -1
		if (n == -1 && r == -1) break

		// check if next linebreak is '/n'
		if (n != -1 && (n < r || r == -1)) {
			result.line++
			lastColumn1 = n + 1
			n = null
		} else if (r != -1 && (r < n || n == -1)) {
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