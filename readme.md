# Great Json

The **greatjson** module is a **JSON.parse** replacement providing clearer syntax messages with line and column numbers, expected tokens and offending text. In addition, errors are returned instead of thrown.

## Get It Now

* [GreatJson](https://github.com/haraldrudell/greatjson) is on github

# Usage

Example of parsing with greatjson:

```js
var greatjson = require('greatjson')
var result, error

// example how to use successfully
if (!((result = greatjson.parse('17')) instanceof Error))
	// It works! I got: 17
	console.log('It works! I got:', result)

// example of parse failure
if (!((error = greatjson.parse('qwerty')) instanceof Error)) ;
else
	// SyntaxError: Unexpected token: expected json value, text:'qwerty' at line:1 column:1 position: 0 (0%)
	console.log(error.toString())

// example of missing comma
if (!((error = greatjson.parse('{"a":5"b":6}')) instanceof Error)) ;
else {
	// SyntaxError: Bad token: expected object comma, text:'"b":6.' at line:1 column:7 position: 6 (50%)
	console.log(error.toString())

	// printout of custom error properties
	var s = []
	for (var p in error) s.push(p + ':' + error[p])
	// Error properties: position:6 line:1 column:7 text:"b":6.
	console.log('Error properties:', s.join(' '))
}
```

# Notes

(c) [Harald Rudell](http://www.haraldrudell.com) wrote this for the love of node in August, 2012

Great Json is based on work by

* [Mike Samuel](http://json-sans-eval.googlecode.com/)
* [Douglas Crockford](https://github.com/douglascrockford/JSON-js)

[JavaScript Object Notation](http://json.org/) or json is a language-independent text format.

[rfc4627](http://www.ietf.org/rfc/rfc4627): the application/json media type.

[JSON.parse](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf#page=215) in secion 15.12.2 of JavaScript.

No warranty expressed or implied. Use at your own risk.

Please suggest better ways, new features, and possible difficulties on [github](https://github.com/haraldrudell/greatjson)