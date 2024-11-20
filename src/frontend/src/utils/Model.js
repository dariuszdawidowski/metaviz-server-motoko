/**
 * Model v 0.3.0
 * Minimalistic model class (MVC) for JavaScript
 * Copyright (C) 2024 Dariusz Dawidowski
 * Licence: MIT
 */


class Table {

    /**
     * Constructor
     */

    constructor(name) {
        this.name = name;
        this.data = null;
        this.callback = null;
    }

    /**
     * Smart append new element to the array or object
     * value: element to append
     */

    append(value) {
        console.log('append', value)
        if (Array.isArray(this.data)) this.data.push(value);
        else if (typeof(this.data) == 'object') Object.assign(this.data, value);
        if (callback) callback(value);
    }

    /**
     * On change callback
     * callback: fn (use null to disable)
     */

    observer(callback) {
        this.callback = callback;
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
     * table: table name
     */

    addTable(name, data) {
        this.tables[name] = data;
    }

    /**
     * Get the table
     * table: table name
     */

    getTable(name) {
        return this.tables[name];
    }

}

