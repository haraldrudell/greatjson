// textparser.js
// parses pieces of json from a string
// © Harald Rudell 2012

var syntaxerror = require('./syntaxerror')
var regexps = require('./regexps')

exports.getParser = getParser

var suddenEnd = 'Unexpected end of input'
var badToken = 'Bad token'
var unToken = 'Unexpected token'

function getParser(text) {
	var unparsed = text = String(text)

	return {
		getSimpleToken: getSimpleToken,
		skipThisCharacter: skipThisCharacter,
		skipCharacter: skipCharacter,
		peekAtNextCharacter: peekAtNextCharacter,
		getString: getString,
		getFullString: getFullString,
		verifyAtEnd: verifyAtEnd,
		getPosition: getPosition,
		reportError: reportError,
	}

	// verify the next non-whitespace character to be ch
	// if match, skip it and return undefined
	// if no match return SyntaxError
	function skipThisCharacter(ch, expected, startPosition) {
		var result
		if (peekAtNextCharacter() != ch) result = reportError(unparsed.length ? badToken : suddenEnd, expected + ' from ' + syntaxerror.getPositionString(text, startPosition))
		else skipCharacter()
		return result
	}

	function getPosition() {
		return text.length - unparsed.length
	}

	// get a string including the opening double quote
	function getFullString() {
		var result
		if (peekAtNextCharacter() != '"') {
			result = reportError(unparsed.length ? badToken : suddenEnd, 'string opening double quote character')
		} else {
			skipCharacter()
			result = getString()
		}
		return result
	}

	// get a json string with escapes resolved
	function getString() {
		var result
		var match = unparsed.match(regexps.jsonString)
		if (match) {
			unparsed = unparsed.substring(match[0].length)
			result = match[1].replace(regexps.jsonStringEscapes, function(matched, escapeChar, escapeHex) {
				return escapeChar ? regexps.jsonStringEscapeMap[escapeChar] : String.fromCharCode(parseInt(escapeHex, 16))
			})
		} else result = reportError('Bad string: unterminated or improper characters or escapes', 'json string')
		return result
	}

	// skip whitespace to the next character
	// return the character without parsing it
	// undefined if at end of string
	function peekAtNextCharacter() {
		skipWhitespace()
		return unparsed[0]
	}

	// remove the next character from unparsed
	// return: true
	function skipCharacter() {
		unparsed = unparsed.substring(1)
		return true
	}

	// return value: undefined
	// or SyntaxError if remaining non-whitespace characters
	function verifyAtEnd() {
		var result
		skipWhitespace()
		if (unparsed.length) result = reportError('Trailing characters', 'end of input', text, unparsed)
		return result
	}

	// find the next json value in unparsed
	// return value:
	// - the opening string
	// - undefined if no parseable value could be found
	function getSimpleToken() {
		var result

		//skipWhitespace()
		var match = unparsed.match(regexps.jsonValue)
		if (match) {
			result = match[1]
			unparsed = unparsed.substring(match[0].length)
		} else skipWhitespace()
		if (!result) {
			result = reportError(unparsed.length ? unToken : suddenEnd, 'json value', text, unparsed)
		}
		return result
	}

	// remove leading whitespace from unparsed
	function skipWhitespace() {
		var match = unparsed.match(regexps.jsonWhitespace)
		if (match) unparsed = unparsed.substring(match[0].length)
		return unparsed.length
	}

	function reportError(message, expected) {
		return syntaxerror.createError(message, expected, text, unparsed)
	}
}