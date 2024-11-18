/**
 * Model v 0.2.0
 * Minimalistic model class (MVC) for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */

export class Model {

    /**
     * Contructor
     * args: {key1: value1, key2: value2}
     */

    constructor(args) {
        this.var = args;
        this.callbacks = {};
    }

    /**
     * Smart append new element to the array or object
     * key: variable name
     * value: element to append
     */

    append(key, value) {
        if (Array.isArray(this.var[key])) this.var[key].push(value);
        else if (typeof(this.var[key]) == 'object') Object.assign(this.var[key], value);
    }

    /**
     * Getter
     * key: variable name
     */

    get(key) {
        return this.var[key];
    }

    /**
     * On change callback
     * key: variable name
     * callback: fn
     */

    observer(key, callback) {
    }

}
