// regexps.js
// Regular expressions used to parse json
// written by Harald Rudell in August, 2012

// loosely based on work by Mike Samuel http://json-sans-eval.googlecode.com/

// matches leading whitespace
// \s is a JavaScript WhiteSpace or LineTerminator character
var whitespace = '\\s*'

// capture leading whitespace
exports.jsonWhitespace = new RegExp('(' + whitespace + ')')

// matches a json number
var jsonNumber = '-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?'

// the first characters of composite types
var jsonStringBegin = '"'
var jsonObjectBegin = '\\{'
var jsonArrayBegin =  '\\['

// captures primitives or the first character of composite types string, object or array
// we must have start of string here to capture leading garbage characters
// and then we must have whitespace to skip leading whitespace
exports.jsonValue = new RegExp('^' + whitespace + '(' +
	jsonStringBegin + '|' +
	jsonNumber + '|' +
	jsonObjectBegin + '|' +
	jsonArrayBegin + '|' +
	'true|' +
	'false|' +
	'null)')

var stringEscapes = '\\\\(?:[\"\\\\\\/bfnrt]|u[0-9A-Fa-f]{4})'

// matches one json string character including escape sequences
var oneChar = '(?:[^\\0-\\x1f\"\\\\]|' + stringEscapes + ')'

// captures a syntactically correct json string
exports.jsonString = new RegExp('^(' + oneChar + '*)"')

// captures a possible escape character and a possible 4 hexadecimal digits
exports.jsonStringEscapes = new RegExp(stringEscapes, 'g')

// maps string escape characters to corresponding escaped value
exports.jsonStringEscapeMap = {
	'"': '"', // double quotation mark
	'/': '/', // solidus
	'\\': '\\', // reverse solidus
	'b': '\b', // backspace
	'f': '\f', // formfeed
	'n': '\n', // newline
	'r': '\r', // carriage return
	't': '\t' // horizontal tab
}