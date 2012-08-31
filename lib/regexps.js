// regexps.js
// Regular expressions used to parse json
// © Harald Rudell 2012

// loosely based on work by Mike Samuel http://json-sans-eval.googlecode.com/

// matches leading whitespace
// \s is a JavaScript WhiteSpace or LineTerminator character
var whitespace = '\\s*'

// capture leading whitespace by itself
exports.jsonWhitespace = new RegExp('(' + whitespace + ')')

// matches a json number
var jsonNumber = '-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?'

// the first characters of composite types
var jsonStringBegin = '"'
var jsonObjectBegin = '\\{'
var jsonArrayBegin =  '\\['

// captures primitives or the first character of composite types string, object or array
// we must have start of string here to avoid ignoring leading garbage characters
// therefore, we must also have whitespace to skip leading whitespace
exports.jsonValue = new RegExp('^' + whitespace + '(' +
	jsonStringBegin + '|' +
	jsonNumber + '|' +
	jsonObjectBegin + '|' +
	jsonArrayBegin + '|' +
	'true|' +
	'false|' +
	'null)')

// all the escapes in string values defined by json
var stringEscapes = '\\\\(?:(["\\\\b\\/fnrt])|u([0-9A-Fa-f]{4}))'

// matches one json string character including escape sequences
var oneChar = '(?:[^\\0-\\x1f"\\\\]|' + stringEscapes + ')'

// captures a syntactically correct json string
// skips terminating double quote
exports.jsonString = new RegExp('^(' + oneChar + '*)"')

// captures the content of a string escape, ie. a single character or 4 hexadecimal digits
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