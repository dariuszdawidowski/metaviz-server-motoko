/**
 * Model v 0.4.0
 * Minimalistic model class (MVC) for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */


class Table {

    /**
     * Constructor
     */

    constructor(name, data = null) {
        this.name = name;
        this.data = data;
        this.callback = null;
    }

    /**
     * Smart append new element to the array or object
     * value: element to append
     */

    append(value) {
        if (Array.isArray(this.data)) this.data.push(value);
        else if (typeof(this.data) == 'object') Object.assign(this.data, value);
        if (this.callback) this.callback();
    }

    /**
     * On change callback
     * callback: fn (use null to disable)
     */

    observer(callback) {
        this.callback = callback;
    }

    /**
     * Get data
     */

    get() {
        return this.data;
    }

}


export class Database {

    /**
     * Constructor
     */

    constructor() {
        this.tables = {};
    }

    /**
     * Add a new table
     * name: table name
     */

    add(name, data) {
        this.tables[name] = new Table(name, data);
    }

    /**
     * Get the table
     * name: table name
     */

    table(name) {
        return this.tables[name];
    }

}

