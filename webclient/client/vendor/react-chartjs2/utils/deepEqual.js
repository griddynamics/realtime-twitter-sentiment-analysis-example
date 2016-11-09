/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Goran Udosic && Headstart App.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
let hasOwnProperty = Object.prototype.hasOwnProperty;

const is = (x, y) => {
	// SameValue algorithm
	if (x === y) {
		// Steps 1-5, 7-10
		// Steps 6.b-6.e: +0 != -0
		return x !== 0 || 1 / x === 1 / y;
	} else {
		// Step 6.a: NaN == NaN
		return x !== x && y !== y;
	}
};

const deepEqual = (objA, objB) => {
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
		return false;
	}

	let keysA = Object.keys(objA);
	let keysB = Object.keys(objB);
	let allKeys = keysA.concat(keysB);

	// Verify both objects have all the keys
	for (let i = 0; i < allKeys.length; i++) {
		if (!hasOwnProperty.call(objB, allKeys[i])) {
			return false;
		}
		if (!hasOwnProperty.call(objA, allKeys[i])) {
			return false;
		}
	}

	for (let propty in objA) {
		if (objB.hasOwnProperty(propty)) {
			if (!deepEqual(objA[propty], objB[propty])) {
				return false;
			}
		}
		else {
			return false;
		}
	}

	return true;
};

export default deepEqual;
