/*
 * Support for Object.keys
 */

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

/*
 *	Randomize array order
 */
//http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function array_shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

/*
 *	Create array of integers in sequential order
 */
function array_sequence_1n(length, start){
	if(start === undefined){start = 0;}
	var array = [];
	for(var i = start, ilen = start + length; i < ilen; i++){
		array.push(i);
	}
	return array;
}

/*
 *	Gets randomized indices / array with complete set of sequential integers
 */
function array_random_indices(length, start){
	if(start === undefined){start = 0;}
	return array_shuffle(array_sequence_1n(length, start));
}

/*
 *	Get random integer in span
 */
function rand_int(a, b){
	return Math.floor((Math.random() * (b - a)) + a);
}

/*
 *	Flip of a coin
 */
function rand_bool(){
	return Math.random() > 0.5;
}