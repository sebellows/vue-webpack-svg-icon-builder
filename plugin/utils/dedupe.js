const typeOf = require('./typeOf');

/*!
Copyright (c) 2018 Jed Watson.
Licensed under the MIT License (MIT), see
http://jedwatson.github.io/classnames
*/

// Don't inherit from Object so we can skip hasOwnProperty check later
// http://stackoverflow.com/questions/15518328/creating-js-object-with-object-createnull#answer-21079232
function StorageObject() {}
StorageObject.prototype = Object.create(null);

function _parseArray(resultSet, array) {
    let length = array.length;

    for (let i = 0; i < length; ++i) {
        _parse(resultSet, array[i]);
    }
}

const hasOwn = {}.hasOwnProperty;

function _parseNumber(resultSet, num) {
    resultSet[num] = true;
}

function _parseObject(resultSet, object) {
    for (const key in object) {
        if (hasOwn.call(object, key)) {
            // Set value to false instead of deleting it to avoid changing object structure
            // https://www.smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/#de-referencing-misconceptions
            resultSet[key] = !!object[key];
        }
    }
}

const SPACE = /\s+/;
function _parseString(resultSet, str) {
    const array = str.split(SPACE);
    let length = array.length;

    for (let i = 0; i < length; ++i) {
        resultSet[array[i]] = true;
    }
}

function _parse(resultSet, arg) {
    if (!arg) return;

    const argType = typeOf(arg);

    switch (argType) {
        case 'string':
            _parseString(resultSet, arg);
            break;
        case 'array':
            _parseArray(resultSet, arg);
            break;
        case 'object':
            _parseObject(resultSet, arg);
            break;
        case 'number':
            _parseNumber(resultSet, arg);
            break;
    }
}

function dedupeClassNames(...args) {
    const classSet = new StorageObject();
    _parseArray(classSet, args);

    const list = [];

    for (const key in classSet) {
        if (classSet[key]) {
            list.push(key);
        }
    }

    return list.join(' ');
}

module.exports = dedupeClassNames;
