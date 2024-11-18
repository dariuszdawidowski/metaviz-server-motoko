/**
 * Model v 0.1.0
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
     * Set the variable value
     * key: name
     * value: data
     */

    set(key, value) {
        this.var[key] = value;
    }

    /**
     * Getter
     * key: name
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
