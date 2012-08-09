// regexps.js
// Regular expressions used to parse json
// written by Harald Rudell in August, 2012

// matches leading whitespace
// \s is a JavaScript WhiteSpace or LineTerminator character
var whiteSpace = '\\s*'

// capture leading whitespace
var jsonWhitespace = new RegExp('(' + leadingWhiteSpace + ')')
console.log('jsonWhitespace', jsonWhitespace)

// matches a json number
var jsonNumber = '0|[1-9][0-9]*(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?'

// the first characters of composite types
var jsonStringBegin = '"'
var jsonObjectBegin = '\\{'
var jsonArrayBegin =  '\\['

// captures primitives or the first character of composite types string, object or array
exports.jsonValue = new RegExp('(' +
	'(' + whitespace + ')' +
	jsonStringBegin + '|' +
	jsonNumber + '|' +
	jsonObjectBegin + '|' +
	jsonArrayBegin + '|' +
	'true|' +
	'false|' +
	'null)')

// matches one json string character including escape sequences
var oneChar = '(?:[^\\0-\\x1f\"\\\\]' +
		+ '|\\\\(?:[\"\\\\/bfnrt]|u[0-9A-Fa-f]{4}))'

// captures a syntactically correct json string
exports.jsonString = '(' + oneChar + '*)"'

// captures a possible escape character and a possible 4 hexadecimal digits
exports.jsonStringEscapes = /\\(?:(["\/\\bfnrt])|u([0-9A-Fa-f]{4}))/g

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