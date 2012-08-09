// jsonparse.js
// equal to JSON.parse enhanced with clearer syntax error messages
// written by Harald Rudell in August, 2012

var syntaxerror = require('./syntaxerror')
var regexps = require('./regexps')

exports.parse = parse

/*
parse json text
text: input to be parsed
reviver: optional function: TODO

return value:
- object on success
- SyntaxError object on failure
*/
function parse(text, reviver) {
	var unparsed = text = String(text)

	var result = getJsonValue()

	if (!(result instanceof Error)) {

		// verify end of input
		skipWhitespace()
		if (unparsed.length) result = syntaxerror.createError('Trailing characters', 'end of input', text, unparsed)
	}

	// revive
	if (!(result instanceof Error) && typeof reviver == 'function') result = revive(result)

	return result

	/*
	find the next json value in unparsed

	return value:
	value on success
	SyntaxError on parse failure
	*/
	function getJsonValue() {
		var result
		var valueMatch

		// parse json from the string unparsed
		var expected = 'json value'
		var message
		switch (valueMatch = getValueMatch()) {
			case undefined: // a parseable token was not found
				if (unparsed.length) message = 'Bad token' // some remaining text that could not be interpreted
				else message = 'Unexpected end of input'
				break
			case 'true':
				result = true
				break
			case 'false':
				result = false
				break
			case 'null':
				result = null
				break
			case '"': // string
				throw Error('token:' + valueMatch + ' NIMP')
			case '[': // array
				result = getArray()
				break
			case '{': // object
				result = getObject()
				break
			default: // number
				result = parseFloat(valueMatch)
				break
		}
		if (message) result = syntaxerror.createError(message, expected, text, unparsed)

		return result
	}

	/*
	if we have an unterminated string, we want to remember where it begun
	if there is a bad character in the string, we want to error at that position
	*/
	function getString() {
		var result
		var str = getString()
		if (!str) {
			result = parseutils.createError('Missing endtoken', 'string-terminating double quote', text, unparsed)
		} else {
			

		}
		return result
	}

	// parse a json object
	function getObject() {
		var result = {}
		for (;;) {
			var key = // TODO
			if (peekAtNextCharacter() != ':') {
				result = syntaxerror.createError('Bad token', 'object property colon', text, unparsed)
				break
			}
			skipCharacter()
			var nextValue = getJsonValue()
			if (nextValue instanceof Error) {
				result = nextValue
				break
			}
			result[key] = nextValue
			var ch = peekAtNextCharacter()
			if (ch == '}') { // end of object
				skipCharacter()
				break
			}
			if (ch != ',') { // not a next value indicator?
				result = syntaxerror.createError('Bad token', 'object comma', text, unparsed)
				break
			}
		}
		return result
	}

	// parse a json array
	function getArray() {
		var result = []
		var nextvalue
		for (;;) {
			if ((nextValue = getJsonValue()) instanceof Error) {
				result = nextValue
				break
			}
			result.push(nextValue)
			var ch = peekAtNextCharacter()
			if (ch == ']') { // end of array
				skipCharacter()
				break
			}
			if (ch != ',') { // not a next value indicator?
				result = syntaxerror.createError('Bad token', 'array comma', text, unparsed)
				break
			}
			skipCharacter()
		}
		return result
	}

	// invoke the reviver function on each possible property of an object
	// use the closure function reviver
	function revive(object) {
		// we need object to be the property of something
		return reviveProperty({'': object}, '')

		// revive the property property of holder
		// return value: the result of invoking reviver on the property value
		function reviveProperty(holder, property) {
			var value = holder[property]
			if (value && typeof value === 'object') {

				// the property value is an object
				// process all of its properties first
				var propertiesToDelete
				for (var p in value) {
					if (Object.hasOwnProperty.call(value, p) && value !== holder) {
						// Recurse to properties first.  This has the effect of causing
						// the reviver to be called on the object graph depth-first.

						// Since 'this' is bound to the holder of the property, the
						// reviver can access sibling properties of k including ones
						// that have not yet been revived.

						// The value returned by the reviver is used in place of the
						// current value of property k.
						// If it returns undefined then the property is deleted.
						// traverse this property first
						var v = walk(value, p)
						// if return value is not undefined, we will keep the value
						if (v !== void 0) value[p] = v
						else {
							// Deleting properties inside the loop has vaguely defined
							// semantics in ES3 and ES3.1.
							if (!propertiesToDelete) propertiesToDelete = []
							propertiesToDelete.push(p)
						}
					}
				}

				// delete the properties requested
				if (propertiesToDelete) propertiesToDelete.forEach(function (property) {
					delete value[property]
				})
			}
			return reviver.call(holder, property, value)
		}
	}

	function nextStringCharacter() {
		var match = unparsed.match(regexps.jsonStringCharacter)
		if (match) {
			result = match[0]
			unparsed = unparsed.substring(result.length)
		}
		return result
	}

	function getString() {
		var match = unparsed.match(regexps.jsonString)
		if (match) {
			result = match[0]
			unparsed = unparsed.substring(result.length)
		}
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
	function skipCharacter() {
		unparsed = unparsed.substring(1)
	}

	// find the next json value in unparsed
	// return value:
	// - the opening string
	// - undefined if no parseable value could be found
	function getValueMatch() {
		var result

		skipWhitespace()
		var match = unparsed.match(regexps.jsonValue)
		if (match) {
			result = match[0]
			unparsed = unparsed.substring(result.length)
		}
		return result
	}

	// remove leading whitespace from unparsed
	function skipWhitespace() {
		var match = unparsed.match(regexps.jsonWhitespace)
		if (match) unparsed = unparsed.substring(match[0].length)
	}

}