// greatjson.js
// equal to JSON.parse enhanced with clearer syntax error messages
// © Harald Rudell 2012

var textparser = require('./textparser')

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
	var result
	var parser = textparser.getParser(text)
	var temp

	if (!((result = getJsonValue()) instanceof Error) && (temp = parser.verifyAtEnd())) result = temp

	// revive
	if (!(result instanceof Error) && typeof reviver == 'function') result = revive(result)

	return result

	/*
	Retrieve the next json value
	return value:
	- value on success
	- SyntaxError on parse failure
	*/
	function getJsonValue() {
		var result = parser.getSimpleToken()
		if (!(result instanceof Error)) switch (result) {
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
				result = parser.getString()
				break
			case '[': // array
				result = getArray()
				break
			case '{': // object
				result = getObject()
				break
			default: // number
				result = parseFloat(result)
				break
		}
		return result
	}

	// parse a json object
	function getObject() {
		var result = {}
		var startPosition = parser.getPosition()
		var key
		var nextValue
		if (parser.peekAtNextCharacter() != '}') for (;;) {
			if ((key = parser.getFullString()) instanceof Error && (result = key)) break
			if ((nextValue = parser.skipThisCharacter(':', 'object colon', startPosition)) && (result = nextValue)) break
			if ((nextValue = getJsonValue()) instanceof Error && (result = nextValue)) break
			result[key] = nextValue
			if (parser.peekAtNextCharacter() == '}' && parser.skipCharacter()) break // end of object
			if ((nextValue = parser.skipThisCharacter(',', 'object comma', startPosition)) && (result = nextValue)) break
		} else parser.skipCharacter()
		return result
	}

	// parse a json array
	function getArray() {
		var result = []
		var nextValue
		var startPosition = parser.getPosition()
		if (parser.peekAtNextCharacter() != ']') for (;;) {
			if ((nextValue = getJsonValue()) instanceof Error && (result = nextValue)) break
			result.push(nextValue)
			if (parser.peekAtNextCharacter() == ']' && parser.skipCharacter()) break // end of array
			if ((nextValue = parser.skipThisCharacter(',', 'array comma', startPosition)) && (result = nextValue)) break
		} else parser.skipCharacter()
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
						var v = reviveProperty(value, p)
						// if return value is not undefined, we will keep the value
						if (v !== void 0) value[p] = v
						else { // ancient code here
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

}