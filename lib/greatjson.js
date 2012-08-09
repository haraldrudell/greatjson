// greatjson.js
// equal to JSON.parse enhanced with clearer syntax error messages
// written by Harald Rudell in August, 2012

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
	var parser = textparser.getParser(text)
	var temp

	var result = getJsonValue()
	if (!(result instanceof Error) && (temp = parser.verifyAtEnd())) result = temp


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
		var key
		var temp
		var nextValue
		for (;;) {
			if ((key = parser.getFullString()) instanceof Error) {
				result = key
				break
			}
			if ((temp = parser.skipThisCharacter(':', 'json object colon separator'))) {
				result = temp
				break
			}
			if ((nextValue = getJsonValue()) instanceof Error) {
				result = nextValue
				break
			}
			result[key] = nextValue
			var ch = parser.peekAtNextCharacter()
			if (ch == '}') { // end of object
				parser.skipCharacter()
				break
			}
			if (temp = parser.skipThisCharacter(',', 'object comma')) {
				result = temp
				break
			}
		}
		return result
	}

	// parse a json array
	function getArray() {
		var result = []
		var nextvalue
		var temp
		for (;;) {
			if ((nextValue = getJsonValue()) instanceof Error) {
				result = nextValue
				break
			}
			result.push(nextValue)
			var ch = parser.peekAtNextCharacter()
			if (ch == ']') { // end of array
				parser.skipCharacter()
				break
			}
			if (temp = parser.skipThisCharacter(',', 'array comma')) {
				result = temp
				break
			}
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
						var v = reviveProperty(value, p)
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

}