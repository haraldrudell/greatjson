// examples.js
// examples for great json
// © Harald Rudell 2012

demonstrate(greatjson, '../../lib/greatjson')

function greatjson(require) {
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
}

function inspect(require) {
var haraldutil = require('haraldutil')
console.log(haraldutil.inspect(console))
}

// utility

function demonstrate(func, relative) {
	console.log('\n===== ' + func.name + '\n')
	console.log(getSource(func))
	console.log()
	func(myRequire(relative))
}

function getSource(func) {
	var match = func.toString().match(/[\s\S]*\{([\s\S]*)\}/m)
	var source = match ? match[1].trim() : ''
	return source
}

// mock require
function myRequire(relative) {
	return function requireWrapper(module) {
		return require(relative)
	}
}